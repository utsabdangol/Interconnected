<?php
session_start();

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, OPTIONS");
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
$user_id = isset($_SESSION['id']) ? $_SESSION['id'] : null;

// Fetch ALL communities (both public and private) with member status
$sql = "SELECT 
    c.id,
    c.com_name,
    c.category,
    c.com_description,
    c.created_by,
    c.created_at,
    c.privacy,
    COUNT(CASE WHEN cm.role != 'requesting' THEN cm.id END) as member_count,
    MAX(CASE WHEN cm.user_id = ? THEN cm.role ELSE NULL END) as user_role
FROM communities c
LEFT JOIN community_members cm ON c.id = cm.community_id
GROUP BY c.id
ORDER BY c.created_at DESC
LIMIT 50";

$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, "i", $user_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

$communities = [];
while ($row = mysqli_fetch_assoc($result)) {
    $communities[] = $row;
}

echo json_encode([
    "status" => "success",
    "communities" => $communities
]);

mysqli_close($conn);
?>