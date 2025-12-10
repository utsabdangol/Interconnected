<?php
session_start();

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, DELETE, OPTIONS");
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

// Check if user is admin
if (!isset($_SESSION['id']) || !isset($_SESSION['role_u']) || $_SESSION['role_u'] !== 'admin') {
    echo json_encode([
        "status" => "error",
        "message" => "Unauthorized - Admin access required"
    ]);
    exit();
}

$action = isset($_GET['action']) ? $_GET['action'] : '';

// ============================================
// GET ALL USERS
// ============================================
if ($action === 'get_users' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT id, username, email, role_u, created_at 
            FROM users 
            ORDER BY created_at DESC";
    
    $result = mysqli_query($conn, $sql);
    
    $users = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $users[] = $row;
    }
    
    echo json_encode([
        "status" => "success",
        "users" => $users
    ]);
}

// ============================================
// GET ALL COMMUNITIES
// ============================================
else if ($action === 'get_communities' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT 
                c.id,
                c.com_name,
                c.category,
                c.com_description,
                c.privacy,
                c.created_at,
                u.username as creator_username,
                COUNT(DISTINCT CASE WHEN cm.role != 'requesting' THEN cm.id END) as member_count
            FROM communities c
            LEFT JOIN users u ON c.created_by = u.id
            LEFT JOIN community_members cm ON c.id = cm.community_id
            GROUP BY c.id
            ORDER BY c.created_at DESC";
    
    $result = mysqli_query($conn, $sql);
    
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
// GET ALL POSTS
// ============================================
else if ($action === 'get_posts' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT 
                p.id,
                p.title,
                p.created_at,
                u.username,
                c.com_name
            FROM posts p
            INNER JOIN users u ON p.user_id = u.id
            INNER JOIN communities c ON p.community_id = c.id
            ORDER BY p.created_at DESC
            LIMIT 100";
    
    $result = mysqli_query($conn, $sql);
    
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
// DELETE USER
// ============================================
else if ($action === 'delete_user' && $_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $data = json_decode(file_get_contents("php://input"), true);
    $user_id = intval($data["user_id"]);
    
    // Prevent deleting admin users
    $check_sql = "SELECT role_u FROM users WHERE id = ?";
    $check_stmt = mysqli_prepare($conn, $check_sql);
    mysqli_stmt_bind_param($check_stmt, "i", $user_id);
    mysqli_stmt_execute($check_stmt);
    $check_result = mysqli_stmt_get_result($check_stmt);
    $user = mysqli_fetch_assoc($check_result);
    
    if ($user && $user['role_u'] === 'admin') {
        echo json_encode([
            "status" => "error",
            "message" => "Cannot delete admin users"
        ]);
        exit();
    }
    
    $delete_sql = "DELETE FROM users WHERE id = ?";
    $delete_stmt = mysqli_prepare($conn, $delete_sql);
    mysqli_stmt_bind_param($delete_stmt, "i", $user_id);
    
    if (mysqli_stmt_execute($delete_stmt)) {
        echo json_encode([
            "status" => "success",
            "message" => "User deleted successfully"
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Failed to delete user"
        ]);
    }
}

// ============================================
// DELETE COMMUNITY
// ============================================
else if ($action === 'delete_community' && $_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $data = json_decode(file_get_contents("php://input"), true);
    $community_id = intval($data["community_id"]);
    
    $delete_sql = "DELETE FROM communities WHERE id = ?";
    $delete_stmt = mysqli_prepare($conn, $delete_sql);
    mysqli_stmt_bind_param($delete_stmt, "i", $community_id);
    
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
// DELETE POST
// ============================================
else if ($action === 'delete_post' && $_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $data = json_decode(file_get_contents("php://input"), true);
    $post_id = intval($data["post_id"]);
    
    $delete_sql = "DELETE FROM posts WHERE id = ?";
    $delete_stmt = mysqli_prepare($conn, $delete_sql);
    mysqli_stmt_bind_param($delete_stmt, "i", $post_id);
    
    if (mysqli_stmt_execute($delete_stmt)) {
        echo json_encode([
            "status" => "success",
            "message" => "Post deleted successfully"
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Failed to delete post"
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