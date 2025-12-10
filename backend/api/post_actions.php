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

// Check authentication for all actions
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
// GET POSTS (with user info, like status, comment count)
// ============================================
if ($action === 'get_posts' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $community_id = isset($_GET['community_id']) ? intval($_GET['community_id']) : null;
    
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
            INNER JOIN community_members cmem ON p.community_id = cmem.community_id 
                AND cmem.user_id = ? 
                AND cmem.role != 'requesting'
            LEFT JOIN post_likes pl ON p.id = pl.post_id
            LEFT JOIN comments cmt ON p.id = cmt.post_id";
    
    if ($community_id) {
        $sql .= " WHERE p.community_id = ?";
    }
    
    $sql .= " GROUP BY p.id ORDER BY p.created_at DESC LIMIT 50";
    
    $stmt = mysqli_prepare($conn, $sql);
    
    if ($community_id) {
        mysqli_stmt_bind_param($stmt, "iii", $user_id, $user_id, $community_id);
    } else {
        mysqli_stmt_bind_param($stmt, "ii", $user_id, $user_id);
    }
    
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
// LIKE/UNLIKE POST
// ============================================
else if ($action === 'toggle_like' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $post_id = intval($data["post_id"]);
    
    // Check if already liked
    $check_sql = "SELECT id FROM post_likes WHERE post_id = ? AND user_id = ?";
    $check_stmt = mysqli_prepare($conn, $check_sql);
    mysqli_stmt_bind_param($check_stmt, "ii", $post_id, $user_id);
    mysqli_stmt_execute($check_stmt);
    $check_result = mysqli_stmt_get_result($check_stmt);
    
    if (mysqli_num_rows($check_result) > 0) {
        // Unlike
        $delete_sql = "DELETE FROM post_likes WHERE post_id = ? AND user_id = ?";
        $delete_stmt = mysqli_prepare($conn, $delete_sql);
        mysqli_stmt_bind_param($delete_stmt, "ii", $post_id, $user_id);
        mysqli_stmt_execute($delete_stmt);
        
        echo json_encode([
            "status" => "success",
            "message" => "Post unliked",
            "liked" => false
        ]);
    } else {
        // Like
        $insert_sql = "INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)";
        $insert_stmt = mysqli_prepare($conn, $insert_sql);
        mysqli_stmt_bind_param($insert_stmt, "ii", $post_id, $user_id);
        mysqli_stmt_execute($insert_stmt);
        
        echo json_encode([
            "status" => "success",
            "message" => "Post liked",
            "liked" => true
        ]);
    }
}

// ============================================
// ADD COMMENT
// ============================================
else if ($action === 'add_comment' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $post_id = intval($data["post_id"]);
    $content = $data["content"];
    $parent_comment_id = isset($data["parent_comment_id"]) ? intval($data["parent_comment_id"]) : null;
    
    if (empty($content)) {
        echo json_encode([
            "status" => "error",
            "message" => "Comment cannot be empty"
        ]);
        exit();
    }
    
    $sql = "INSERT INTO comments (post_id, user_id, parent_comment_id, content) VALUES (?, ?, ?, ?)";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "iiis", $post_id, $user_id, $parent_comment_id, $content);
    
    if (mysqli_stmt_execute($stmt)) {
        echo json_encode([
            "status" => "success",
            "message" => "Comment added",
            "comment_id" => mysqli_insert_id($conn)
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Failed to add comment"
        ]);
    }
}

// ============================================
// GET COMMENTS FOR A POST
// ============================================
else if ($action === 'get_comments' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $post_id = intval($_GET['post_id']);
    
    $sql = "SELECT 
                c.id,
                c.post_id,
                c.user_id,
                c.parent_comment_id,
                c.content,
                c.created_at,
                u.username
            FROM comments c
            INNER JOIN users u ON c.user_id = u.id
            WHERE c.post_id = ?
            ORDER BY c.created_at ASC";
    
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "i", $post_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    $comments = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $comments[] = $row;
    }
    
    echo json_encode([
        "status" => "success",
        "comments" => $comments
    ]);
}

// ============================================
// DELETE POST
// ============================================
else if ($action === 'delete_post' && $_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $data = json_decode(file_get_contents("php://input"), true);
    $post_id = intval($data["post_id"]);
    
    // Verify user owns the post
    $check_sql = "SELECT id FROM posts WHERE id = ? AND user_id = ?";
    $check_stmt = mysqli_prepare($conn, $check_sql);
    mysqli_stmt_bind_param($check_stmt, "ii", $post_id, $user_id);
    mysqli_stmt_execute($check_stmt);
    $check_result = mysqli_stmt_get_result($check_stmt);
    
    if (mysqli_num_rows($check_result) === 0) {
        echo json_encode([
            "status" => "error",
            "message" => "You can only delete your own posts"
        ]);
        exit();
    }
    
    $delete_sql = "DELETE FROM posts WHERE id = ? AND user_id = ?";
    $delete_stmt = mysqli_prepare($conn, $delete_sql);
    mysqli_stmt_bind_param($delete_stmt, "ii", $post_id, $user_id);
    
    if (mysqli_stmt_execute($delete_stmt)) {
        echo json_encode([
            "status" => "success",
            "message" => "Post deleted"
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Failed to delete post"
        ]);
    }
}

// ============================================
// UPDATE POST
// ============================================
else if ($action === 'update_post' && $_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents("php://input"), true);
    $post_id = intval($data["post_id"]);
    $title = $data["title"];
    $content = $data["content"];
    
    // Verify user owns the post
    $check_sql = "SELECT id FROM posts WHERE id = ? AND user_id = ?";
    $check_stmt = mysqli_prepare($conn, $check_sql);
    mysqli_stmt_bind_param($check_stmt, "ii", $post_id, $user_id);
    mysqli_stmt_execute($check_stmt);
    $check_result = mysqli_stmt_get_result($check_stmt);
    
    if (mysqli_num_rows($check_result) === 0) {
        echo json_encode([
            "status" => "error",
            "message" => "You can only update your own posts"
        ]);
        exit();
    }
    
    $update_sql = "UPDATE posts SET title = ?, content = ? WHERE id = ? AND user_id = ?";
    $update_stmt = mysqli_prepare($conn, $update_sql);
    mysqli_stmt_bind_param($update_stmt, "ssii", $title, $content, $post_id, $user_id);
    
    if (mysqli_stmt_execute($update_stmt)) {
        echo json_encode([
            "status" => "success",
            "message" => "Post updated"
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Failed to update post"
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