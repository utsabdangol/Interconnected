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

// Check authentication
if (!isset($_SESSION['id'])) {
    echo json_encode([
        "status" => "error",
        "message" => "Not authenticated"
    ]);
    exit();
}

$user_id = $_SESSION['id'];
$data = json_decode(file_get_contents("php://input"), true);
$community_id = isset($data["community_id"]) ? intval($data["community_id"]) : 0;

if ($community_id <= 0) {
    echo json_encode([
        "status" => "error",
        "message" => "Invalid community ID"
    ]);
    exit();
}

// Check if user is the creator (creators cannot leave, they must delete)
$creator_sql = "SELECT id FROM communities WHERE id = ? AND created_by = ?";
$creator_stmt = mysqli_prepare($conn, $creator_sql);
mysqli_stmt_bind_param($creator_stmt, "ii", $community_id, $user_id);
mysqli_stmt_execute($creator_stmt);
$creator_result = mysqli_stmt_get_result($creator_stmt);

if (mysqli_num_rows($creator_result) > 0) {
    echo json_encode([
        "status" => "error",
        "message" => "As the creator, you cannot leave. You must delete the community if you wish to remove it."
    ]);
    exit();
}

// Check if user is a member
$member_sql = "SELECT id FROM community_members WHERE community_id = ? AND user_id = ?";
$member_stmt = mysqli_prepare($conn, $member_sql);
mysqli_stmt_bind_param($member_stmt, "ii", $community_id, $user_id);
mysqli_stmt_execute($member_stmt);
$member_result = mysqli_stmt_get_result($member_stmt);

if (mysqli_num_rows($member_result) === 0) {
    echo json_encode([
        "status" => "error",
        "message" => "You are not a member of this community"
    ]);
    exit();
}

// Remove member
$delete_sql = "DELETE FROM community_members WHERE community_id = ? AND user_id = ?";
$delete_stmt = mysqli_prepare($conn, $delete_sql);
mysqli_stmt_bind_param($delete_stmt, "ii", $community_id, $user_id);

if (mysqli_stmt_execute($delete_stmt)) {
    echo json_encode([
        "status" => "success",
        "message" => "Successfully left the community"
    ]);
} else {
    echo json_encode([
        "status" => "error",
        "message" => "Failed to leave community"
    ]);
}

mysqli_close($conn);
?>
