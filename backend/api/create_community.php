<?php

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
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

$data = json_decode(file_get_contents("php://input"), true);

$com_name = $data["com_name"];
$category = $data["category"];
$com_description = $data["com_description"];
$created_by = $data["created_by"];

if (!empty($com_name) && !empty($category) && !empty($com_description) && !empty($created_by)) {
    
    // Insert new community
    $sql = "INSERT INTO communities (com_name, category, com_description, created_by)
            VALUES ('$com_name', '$category', '$com_description', '$created_by')";
    
    $res = mysqli_query($conn, $sql);

    if ($res) {
        // Get the ID of the newly created community
        $community_id = mysqli_insert_id($conn);

        // Insert creator into community_members
        $stmt = "INSERT INTO community_members (community_id, user_id, role)
                 VALUES ($community_id, $created_by, 'creator')";
        
        $res1 = mysqli_query($conn, $stmt);

        if ($res1) {
            echo json_encode([
                "status" => "success",
                "message" => "Community created successfully"
            ]);
        } else {
            echo json_encode([
                "status" => "error",
                "message" => "Failed to add creator to community_members"
            ]);
        }
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Failed to create community"
        ]);
    }
}
