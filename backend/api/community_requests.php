<?php
session_start();

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
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

if (!isset($_SESSION['id'])) {
    echo json_encode([
        "status" => "error",
        "message" => "Not authenticated"
    ]);
    exit();
}

$user_id = $_SESSION['id'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

// ============================================
// GET PENDING REQUESTS FOR USER'S COMMUNITIES
// ============================================
if ($action === 'get_requests' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT 
                cm.id as request_id,
                cm.community_id,
                cm.user_id,
                cm.joined_at,
                u.username,
                c.com_name
            FROM community_members cm
            INNER JOIN users u ON cm.user_id = u.id
            INNER JOIN communities c ON cm.community_id = c.id
            WHERE cm.role = 'requesting' 
            AND c.created_by = ?
            ORDER BY cm.joined_at DESC";
    
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "i", $user_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    $requests = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $requests[] = $row;
    }
    
    echo json_encode([
        "status" => "success",
        "requests" => $requests
    ]);
}

// ============================================
// APPROVE REQUEST
// ============================================
else if ($action === 'approve_request' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $request_id = intval($data["request_id"]);
    
    // Verify user is the creator of the community
    $verify_sql = "SELECT cm.community_id, cm.user_id 
                   FROM community_members cm
                   INNER JOIN communities c ON cm.community_id = c.id
                   WHERE cm.id = ? AND c.created_by = ?";
    $verify_stmt = mysqli_prepare($conn, $verify_sql);
    mysqli_stmt_bind_param($verify_stmt, "ii", $request_id, $user_id);
    mysqli_stmt_execute($verify_stmt);
    $verify_result = mysqli_stmt_get_result($verify_stmt);
    
    if (mysqli_num_rows($verify_result) === 0) {
        echo json_encode([
            "status" => "error",
            "message" => "You don't have permission to approve this request"
        ]);
        exit();
    }
    
    // Update role to member
    $update_sql = "UPDATE community_members SET role = 'member' WHERE id = ?";
    $update_stmt = mysqli_prepare($conn, $update_sql);
    mysqli_stmt_bind_param($update_stmt, "i", $request_id);
    
    if (mysqli_stmt_execute($update_stmt)) {
        echo json_encode([
            "status" => "success",
            "message" => "Request approved"
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Failed to approve request"
        ]);
    }
}

// ============================================
// REJECT REQUEST
// ============================================
else if ($action === 'reject_request' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $request_id = intval($data["request_id"]);
    
    // Verify user is the creator of the community
    $verify_sql = "SELECT cm.community_id 
                   FROM community_members cm
                   INNER JOIN communities c ON cm.community_id = c.id
                   WHERE cm.id = ? AND c.created_by = ?";
    $verify_stmt = mysqli_prepare($conn, $verify_sql);
    mysqli_stmt_bind_param($verify_stmt, "ii", $request_id, $user_id);
    mysqli_stmt_execute($verify_stmt);
    $verify_result = mysqli_stmt_get_result($verify_stmt);
    
    if (mysqli_num_rows($verify_result) === 0) {
        echo json_encode([
            "status" => "error",
            "message" => "You don't have permission to reject this request"
        ]);
        exit();
    }
    
    // Delete the request
    $delete_sql = "DELETE FROM community_members WHERE id = ?";
    $delete_stmt = mysqli_prepare($conn, $delete_sql);
    mysqli_stmt_bind_param($delete_stmt, "i", $request_id);
    
    if (mysqli_stmt_execute($delete_stmt)) {
        echo json_encode([
            "status" => "success",
            "message" => "Request rejected"
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Failed to reject request"
        ]);
    }
}

else {
    echo json_encode([
        "status" => "error",
        "message" => "Invalid action"
    ]);
}

mysqli_close($conn);
?>