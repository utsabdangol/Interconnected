<?php
session_start();

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Check authentication
if (!isset($_SESSION['id'])) {
    echo json_encode([
        "status" => "error",
        "message" => "Not authenticated"
    ]);
    exit();
}

$servername = "localhost";
$username = "root";
$password = "";
$db = "interconnected_db";

$conn = mysqli_connect($servername, $username, $password, $db);

if (!$conn) {
    echo json_encode([
        "status" => "error",
        "message" => "Database connection failed"
    ]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

$com_name = isset($data["com_name"]) ? trim($data["com_name"]) : "";
$category = isset($data["category"]) ? trim($data["category"]) : "";
$com_description = isset($data["com_description"]) ? trim($data["com_description"]) : "";
$privacy = isset($data["privacy"]) ? $data["privacy"] : "public";
$created_by = $_SESSION['id']; // Get from session, not from request

// Validation
if (empty($com_name) || empty($category) || empty($com_description)) {
    echo json_encode([
        "status" => "error",
        "message" => "All fields are required"
    ]);
    exit();
}

// Validate privacy value
if ($privacy !== 'public' && $privacy !== 'private') {
    $privacy = 'public'; // Default to public if invalid
}

// Insert new community using prepared statement
$sql = "INSERT INTO communities (com_name, category, com_description, created_by, privacy)
        VALUES (?, ?, ?, ?, ?)";

$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, "sssis", $com_name, $category, $com_description, $created_by, $privacy);

if (mysqli_stmt_execute($stmt)) {
    // Get the ID of the newly created community
    $community_id = mysqli_insert_id($conn);
    
    // Insert creator into community_members
    $member_sql = "INSERT INTO community_members (community_id, user_id, role)
                   VALUES (?, ?, 'creator')";
    
    $member_stmt = mysqli_prepare($conn, $member_sql);
    mysqli_stmt_bind_param($member_stmt, "ii", $community_id, $created_by);
    
    if (mysqli_stmt_execute($member_stmt)) {
        echo json_encode([
            "status" => "success",
            "message" => "Community created successfully",
            "community_id" => $community_id
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Failed to add creator to community_members"
        ]);
    }
} else {
    echo json_encode([
        "status" => "error",
        "message" => "Failed to create community"
    ]);
}

mysqli_close($conn);
?>