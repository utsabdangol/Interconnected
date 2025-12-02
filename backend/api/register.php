<?php

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
$servername="localhost";
$rootname="root";
$dbpassword="";
$db="interconnected_db";
$conn=mysqli_connect($servername,$rootname,$dbpassword,$db);
if(!$conn){
     echo json_encode([
        "status" => "error",
        "message" => "Database connection failed"

    ]);
}
// Read raw JSON
$data = json_decode(file_get_contents("php://input"), true);

$username = $data["username"];
$email = $data["email"];
$password = $data["password"];

// Example response
if (!empty($email) && !empty($password)) {
    $sql="insert into users(username,password_hash,email)values('$username','$password','$email')";
    $res=mysqli_query($conn,$sql);
    if($res){
    echo json_encode([
        "status" => "success",
        "message" => "User registered successfully",
        "user" => $username
    ]);
    }
    else{
      echo json_encode([
        "status" => "error",
        "message" => "Missing fields",
    ]);

    }
    
} else {
    echo json_encode([
        "status" => "error",
        "message" => "Missing fields"
    ]);
}
?>