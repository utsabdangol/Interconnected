<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

session_start();

$servername = "localhost";
$rootname = "root";
$dbpassword = "";
$db = "interconnected_db";

$conn = mysqli_connect($servername, $rootname, $dbpassword, $db);

if (!$conn) {
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);
$email = isset($data["email"]) ? trim($data["email"]) : "";
$password = isset($data["password"]) ? $data["password"] : "";

if (empty($email) || empty($password)) {
    echo json_encode([
        "success" => false,
        "message" => "Email and password are required"
    ]);
    exit();
}

$query = "SELECT id, username, email, password_hash, role_u FROM users WHERE email = ?";
$stmt = mysqli_prepare($conn, $query);
mysqli_stmt_bind_param($stmt, "s", $email);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$row = mysqli_fetch_assoc($result);

if ($row && password_verify($password, $row["password_hash"])) {
    $_SESSION["id"] = $row["id"];
    $_SESSION["username"] = $row["username"];
    $_SESSION["email"] = $row["email"];
    $_SESSION["role_u"] = $row["role_u"];
    
    echo json_encode([
        "success" => true,
        "message" => "Login successful",
        "user" => [
            "id" => $row["id"],
            "username" => $row["username"],
            "role_u" => $row["role_u"]
        ]
    ]);
    exit();
}

echo json_encode([
    "success" => false,
    "message" => "Invalid email or password"
]);

mysqli_close($conn);
exit();
?>