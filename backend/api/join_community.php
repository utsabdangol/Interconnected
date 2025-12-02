<?php
session_start();

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
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

// Get user_id from session
if (!isset($_SESSION['id'])) {
    echo json_encode([
        "status" => "error",
        "message" => "Not authenticated"
    ]);
    exit();
}

$user_id = $_SESSION['id'];
$data = json_decode(file_get_contents("php://input"), true);
$community_id = $data["community_id"];

if (empty($community_id)) {
    echo json_encode([
        "status" => "error",
        "message" => "Community ID is required"
    ]);
    exit();
}

// Check if already a member
$check_sql = "SELECT id FROM community_members WHERE community_id = ? AND user_id = ?";
$check_stmt = mysqli_prepare($conn, $check_sql);
mysqli_stmt_bind_param($check_stmt, "ii", $community_id, $user_id);
mysqli_stmt_execute($check_stmt);
$check_result = mysqli_stmt_get_result($check_stmt);

if (mysqli_num_rows($check_result) > 0) {
    echo json_encode([
        "status" => "error",
        "message" => "Already a member"
    ]);
    exit();
}

// Insert into community_members
$sql = "INSERT INTO community_members (community_id, user_id, role) VALUES (?, ?, 'member')";
$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, "ii", $community_id, $user_id);

if (mysqli_stmt_execute($stmt)) {
    echo json_encode([
        "status" => "success",
        "message" => "Successfully joined community"
    ]);
} else {
    echo json_encode([
        "status" => "error",
        "message" => "Failed to join community"
    ]);
}

mysqli_close($conn);
?>