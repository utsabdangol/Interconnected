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

// GET USER'S COMMUNITIES
if ($action === 'get_user_communities' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT c.id, c.com_name, c.category
            FROM communities c
            INNER JOIN community_members cm ON c.id = cm.community_id
            WHERE cm.user_id = ? AND cm.role != 'requesting'
            ORDER BY c.com_name ASC";

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


// CREATE POST
else if ($action === 'create_post' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $community_id = $_POST['community_id'] ?? null;
    $title = $_POST['title'] ?? null;
    $content = $_POST['content'] ?? null;

    if (empty($community_id) || empty($title) || empty($content)) {
        echo json_encode([
            "status" => "error",
            "message" => "All fields are required"
        ]);
        exit();
    }

    $image_path = null;
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $ext = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
        $image_path = "uploads/posts/" . uniqid() . "." . $ext;
        move_uploaded_file($_FILES['image']['tmp_name'], "../" . $image_path);
    }

    // Membership check
    $check_sql = "SELECT id FROM community_members WHERE community_id = ? AND user_id = ? AND role != 'requesting'";
    $check_stmt = mysqli_prepare($conn, $check_sql);
    mysqli_stmt_bind_param($check_stmt, "ii", $community_id, $user_id);
    mysqli_stmt_execute($check_stmt);
    $check_result = mysqli_stmt_get_result($check_stmt);

    if (mysqli_num_rows($check_result) === 0) {
        echo json_encode([
            "status" => "error",
            "message" => "You must be a member of this community to post"
        ]);
        exit();
    }


    $sql = "INSERT INTO posts (community_id, user_id, title, content, image) 
            VALUES (?, ?, ?, ?, ?)";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "iisss", $community_id, $user_id, $title, $content, $image_path);

    if (mysqli_stmt_execute($stmt)) {
        echo json_encode([
            "status" => "success",
            "message" => "Post created successfully",
            "post_id" => mysqli_insert_id($conn)
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Failed to create post"
        ]);
    }
}

mysqli_close($conn);
?>