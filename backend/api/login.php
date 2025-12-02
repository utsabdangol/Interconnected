<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

// Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

session_start();

// DB connection (same as register)
$servername="localhost";
$rootname="root";
$dbpassword="";
$db="interconnected_db";
$conn=mysqli_connect($servername,$rootname,$dbpassword,$db);

if(!$conn){
    echo json_encode(["success" => false, "message" => "DB failed"]);
    exit();
}

// Read JSON
$data = json_decode(file_get_contents("php://input"), true);

$email = $data["email"];
$password = $data["password"];

// Look inside the SAME table register used
$query = "SELECT * FROM users WHERE email='$email'";
$result = mysqli_query($conn, $query);
$row = mysqli_fetch_assoc($result);

if ($row && $row["password_hash"] === $password) {

    $_SESSION["id"] = $row["id"];
    $_SESSION["username"] = $row["username"];

    echo json_encode([
        "success" => true,
        "message" => "Login successful"
    ]);
    exit();
}

echo json_encode([
    "success" => false,
    "message" => "Invalid credentials"
]);
exit();
?>
