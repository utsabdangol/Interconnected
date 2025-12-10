<?php
session_start();

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, DELETE, PUT, OPTIONS");
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
$action = isset($_GET['action']) ? $_GET['action'] : '';

// ============================================
// GET USER'S POSTS
// ============================================
if ($action === 'get_user_posts' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT 
                p.id,
                p.community_id,
                p.user_id,
                p.title,
                p.content,
                p.image,
                p.created_at,
                u.username,
                c.com_name,
                COUNT(DISTINCT pl.id) as like_count,
                COUNT(DISTINCT cmt.id) as comment_count,
                MAX(CASE WHEN pl.user_id = ? THEN 1 ELSE 0 END) as user_liked
            FROM posts p
            INNER JOIN users u ON p.user_id = u.id
            INNER JOIN communities c ON p.community_id = c.id
            LEFT JOIN post_likes pl ON p.id = pl.post_id
            LEFT JOIN comments cmt ON p.id = cmt.post_id
            WHERE p.user_id = ?
            GROUP BY p.id 
            ORDER BY p.created_at DESC";
    
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "ii", $user_id, $user_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    $posts = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $posts[] = $row;
    }
    
    echo json_encode([
        "status" => "success",
        "posts" => $posts
    ]);
}

// ============================================
// GET COMMUNITIES CREATED BY USER
// ============================================
else if ($action === 'get_created_communities' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT 
                c.id,
                c.com_name,
                c.category,
                c.com_description,
                c.created_at,
                COUNT(DISTINCT cm.id) as member_count
            FROM communities c
            LEFT JOIN community_members cm ON c.id = cm.community_id
            WHERE c.created_by = ?
            GROUP BY c.id
            ORDER BY c.created_at DESC";
    
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
}

// ============================================
// UPDATE COMMUNITY
// ============================================
else if ($action === 'update_community' && $_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    $community_id = intval($data["community_id"]);
    $com_name = $data["com_name"];
    $category = $data["category"];
    $com_description = $data["com_description"];
    $privacy = isset($data["privacy"]) ? $data["privacy"] : "public";
    
    // Validate privacy
    if ($privacy !== 'public' && $privacy !== 'private') {
        $privacy = 'public';
    }
    
    // Verify user is the creator
    $check_sql = "SELECT id FROM communities WHERE id = ? AND created_by = ?";
    $check_stmt = mysqli_prepare($conn, $check_sql);
    mysqli_stmt_bind_param($check_stmt, "ii", $community_id, $user_id);
    mysqli_stmt_execute($check_stmt);
    $check_result = mysqli_stmt_get_result($check_stmt);
    
    if (mysqli_num_rows($check_result) === 0) {
        echo json_encode([
            "status" => "error",
            "message" => "You can only edit communities you created"
        ]);
        exit();
    }
    
    // Update community with privacy
    $update_sql = "UPDATE communities 
                   SET com_name = ?, category = ?, com_description = ?, privacy = ?
                   WHERE id = ? AND created_by = ?";
    $update_stmt = mysqli_prepare($conn, $update_sql);
    mysqli_stmt_bind_param($update_stmt, "ssssii", $com_name, $category, $com_description, $privacy, $community_id, $user_id);
    
    if (mysqli_stmt_execute($update_stmt)) {
        echo json_encode([
            "status" => "success",
            "message" => "Community updated successfully"
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Failed to update community"
        ]);
    }
}
// ============================================
// DELETE COMMUNITY
// ============================================
else if ($action === 'delete_community' && $_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $data = json_decode(file_get_contents("php://input"), true);
    $community_id = intval($data["community_id"]);
    
    // Verify user is the creator
    $check_sql = "SELECT id FROM communities WHERE id = ? AND created_by = ?";
    $check_stmt = mysqli_prepare($conn, $check_sql);
    mysqli_stmt_bind_param($check_stmt, "ii", $community_id, $user_id);
    mysqli_stmt_execute($check_stmt);
    $check_result = mysqli_stmt_get_result($check_stmt);
    
    if (mysqli_num_rows($check_result) === 0) {
        echo json_encode([
            "status" => "error",
            "message" => "You can only delete communities you created"
        ]);
        exit();
    }
    
    // Delete community (CASCADE will handle posts, members, etc.)
    $delete_sql = "DELETE FROM communities WHERE id = ? AND created_by = ?";
    $delete_stmt = mysqli_prepare($conn, $delete_sql);
    mysqli_stmt_bind_param($delete_stmt, "ii", $community_id, $user_id);
    
    if (mysqli_stmt_execute($delete_stmt)) {
        echo json_encode([
            "status" => "success",
            "message" => "Community deleted successfully"
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Failed to delete community"
        ]);
    }
}

// ============================================
// INVALID ACTION
// ============================================
else {
    echo json_encode([
        "status" => "error",
        "message" => "Invalid action"
    ]);
}


mysqli_close($conn);
?>