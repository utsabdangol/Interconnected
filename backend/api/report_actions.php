<?php
session_start();

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS");
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
// SUBMIT REPORT
// ============================================
if ($action === 'submit_report' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    $reported_item_type = $data["reported_item_type"];
    $reported_item_id = intval($data["reported_item_id"]);
    $reason = $data["reason"];
    $description = isset($data["description"]) ? $data["description"] : "";
    
    if (empty($reported_item_type) || empty($reported_item_id) || empty($reason)) {
        echo json_encode([
            "status" => "error",
            "message" => "All fields are required"
        ]);
        exit();
    }
    
    // Validate item type
    $valid_types = ['post', 'comment', 'user', 'community'];
    if (!in_array($reported_item_type, $valid_types)) {
        echo json_encode([
            "status" => "error",
            "message" => "Invalid item type"
        ]);
        exit();
    }
    
    // Check if user already reported this item
    $check_sql = "SELECT id FROM reports 
                  WHERE reporter_id = ? 
                  AND reported_item_type = ? 
                  AND reported_item_id = ?
                  AND status IN ('pending', 'under_review')";
    $check_stmt = mysqli_prepare($conn, $check_sql);
    mysqli_stmt_bind_param($check_stmt, "isi", $user_id, $reported_item_type, $reported_item_id);
    mysqli_stmt_execute($check_stmt);
    $check_result = mysqli_stmt_get_result($check_stmt);
    
    if (mysqli_num_rows($check_result) > 0) {
        echo json_encode([
            "status" => "error",
            "message" => "You have already reported this item"
        ]);
        exit();
    }
    
    // Insert report
    $sql = "INSERT INTO reports (reporter_id, reported_item_type, reported_item_id, reason, description)
            VALUES (?, ?, ?, ?, ?)";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "isiss", $user_id, $reported_item_type, $reported_item_id, $reason, $description);
    
    if (mysqli_stmt_execute($stmt)) {
        echo json_encode([
            "status" => "success",
            "message" => "Report submitted successfully"
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Failed to submit report"
        ]);
    }
}

// ============================================
// GET ALL REPORTS (Admin Only)
// ============================================
else if ($action === 'get_reports' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    // Check if user is admin
    if (!isset($_SESSION['role_u']) || $_SESSION['role_u'] !== 'admin') {
        echo json_encode([
            "status" => "error",
            "message" => "Unauthorized"
        ]);
        exit();
    }
    
    $status_filter = isset($_GET['status']) ? $_GET['status'] : 'all';
    
    $sql = "SELECT 
                r.id,
                r.reported_item_type,
                r.reported_item_id,
                r.reason,
                r.description,
                r.status,
                r.admin_notes,
                r.created_at,
                r.reviewed_at,
                u1.username as reporter_username,
                u2.username as reviewed_by_username
            FROM reports r
            INNER JOIN users u1 ON r.reporter_id = u1.id
            LEFT JOIN users u2 ON r.reviewed_by = u2.id";
    
    if ($status_filter !== 'all') {
        $sql .= " WHERE r.status = ?";
    }
    
    $sql .= " ORDER BY r.created_at DESC LIMIT 100";
    
    $stmt = mysqli_prepare($conn, $sql);
    
    if ($status_filter !== 'all') {
        mysqli_stmt_bind_param($stmt, "s", $status_filter);
    }
    
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    $reports = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $reports[] = $row;
    }
    
    echo json_encode([
        "status" => "success",
        "reports" => $reports
    ]);
}

// ============================================
// UPDATE REPORT STATUS (Admin Only)
// ============================================
else if ($action === 'update_report' && $_SERVER['REQUEST_METHOD'] === 'PUT') {
    // Check if user is admin
    if (!isset($_SESSION['role_u']) || $_SESSION['role_u'] !== 'admin') {
        echo json_encode([
            "status" => "error",
            "message" => "Unauthorized"
        ]);
        exit();
    }
    
    $data = json_decode(file_get_contents("php://input"), true);
    
    $report_id = intval($data["report_id"]);
    $new_status = $data["status"];
    $admin_notes = isset($data["admin_notes"]) ? $data["admin_notes"] : "";
    
    $valid_statuses = ['pending', 'under_review', 'resolved', 'dismissed'];
    if (!in_array($new_status, $valid_statuses)) {
        echo json_encode([
            "status" => "error",
            "message" => "Invalid status"
        ]);
        exit();
    }
    
    $sql = "UPDATE reports 
            SET status = ?, admin_notes = ?, reviewed_by = ?, reviewed_at = NOW()
            WHERE id = ?";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "ssii", $new_status, $admin_notes, $user_id, $report_id);
    
    if (mysqli_stmt_execute($stmt)) {
        echo json_encode([
            "status" => "success",
            "message" => "Report updated successfully"
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Failed to update report"
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