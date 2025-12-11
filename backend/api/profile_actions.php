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
// GET USER PROFILE BY USER ID
// ============================================
else if ($action === 'get_user_profile' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $target_user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;
    
    if ($target_user_id <= 0) {
        echo json_encode([
            "status" => "error",
            "message" => "Invalid user ID"
        ]);
        exit();
    }
    
    // Get user basic info
    $user_sql = "SELECT id, username, email, created_at FROM users WHERE id = ?";
    $user_stmt = mysqli_prepare($conn, $user_sql);
    mysqli_stmt_bind_param($user_stmt, "i", $target_user_id);
    mysqli_stmt_execute($user_stmt);
    $user_result = mysqli_stmt_get_result($user_stmt);
    
    if (mysqli_num_rows($user_result) === 0) {
        echo json_encode([
            "status" => "error",
            "message" => "User not found"
        ]);
        exit();
    }
    
    $user_data = mysqli_fetch_assoc($user_result);
    
    // Get user's post count
    $post_count_sql = "SELECT COUNT(*) as post_count FROM posts WHERE user_id = ?";
    $post_count_stmt = mysqli_prepare($conn, $post_count_sql);
    mysqli_stmt_bind_param($post_count_stmt, "i", $target_user_id);
    mysqli_stmt_execute($post_count_stmt);
    $post_count_result = mysqli_stmt_get_result($post_count_stmt);
    $post_count_data = mysqli_fetch_assoc($post_count_result);
    
    // Get user's community memberships count
    $community_count_sql = "SELECT COUNT(*) as community_count FROM community_members WHERE user_id = ? AND role != 'requesting'";
    $community_count_stmt = mysqli_prepare($conn, $community_count_sql);
    mysqli_stmt_bind_param($community_count_stmt, "i", $target_user_id);
    mysqli_stmt_execute($community_count_stmt);
    $community_count_result = mysqli_stmt_get_result($community_count_stmt);
    $community_count_data = mysqli_fetch_assoc($community_count_result);
    
    // Get reports against this user
    $reports_sql = "SELECT 
                        r.id,
                        r.reason,
                        r.description,
                        r.status,
                        r.created_at,
                        u.username as reporter_username
                    FROM reports r
                    INNER JOIN users u ON r.reporter_id = u.id
                    WHERE r.reported_item_type = 'user' 
                    AND r.reported_item_id = ?
                    ORDER BY r.created_at DESC";
    $reports_stmt = mysqli_prepare($conn, $reports_sql);
    mysqli_stmt_bind_param($reports_stmt, "i", $target_user_id);
    mysqli_stmt_execute($reports_stmt);
    $reports_result = mysqli_stmt_get_result($reports_stmt);
    
    $reports = [];
    while ($row = mysqli_fetch_assoc($reports_result)) {
        $reports[] = $row;
    }
    
    echo json_encode([
        "status" => "success",
        "user" => [
            "id" => $user_data['id'],
            "username" => $user_data['username'],
            "email" => $user_data['email'],
            "created_at" => $user_data['created_at'],
            "post_count" => $post_count_data['post_count'],
            "community_count" => $community_count_data['community_count'],
            "reports" => $reports,
            "report_count" => count($reports)
        ]
    ]);
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