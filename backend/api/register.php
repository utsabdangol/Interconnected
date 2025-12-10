<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$servername = "localhost";
$rootname = "root";
$dbpassword = "";
$db = "interconnected_db";

$conn = mysqli_connect($servername, $rootname, $dbpassword, $db);

if (!$conn) {
    echo json_encode([
        "status" => "error",
        "message" => "Database connection failed"
    ]);
    exit();
}

// Read raw JSON
$data = json_decode(file_get_contents("php://input"), true);

$username = isset($data["username"]) ? trim($data["username"]) : "";
$email = isset($data["email"]) ? trim($data["email"]) : "";
$password = isset($data["password"]) ? $data["password"] : "";

// Validation
$errors = [];

// Check if fields are empty
if (empty($username) || empty($email) || empty($password)) {
    echo json_encode([
        "status" => "error",
        "message" => "All fields are required"
    ]);
    exit();
}

// Username validation
if (strlen($username) < 3) {
    $errors[] = "Username must be at least 3 characters long";
}
if (strlen($username) > 20) {
    $errors[] = "Username must be less than 20 characters";
}
if (preg_match('/^\d/', $username)) {
    $errors[] = "Username cannot start with a number";
}
if (!preg_match('/^[a-zA-Z][a-zA-Z0-9_]*$/', $username)) {
    $errors[] = "Username can only contain letters, numbers, and underscores";
}

// Email validation
if (preg_match('/^\d/', $email)) {
    $errors[] = "Email cannot start with a number";
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = "Invalid email format";
}

// Password validation
if (strlen($password) < 6) {
    $errors[] = "Password must be at least 6 characters long";
}
if (strlen($password) > 50) {
    $errors[] = "Password must be less than 50 characters";
}
if (!preg_match('/[a-z]/', $password)) {
    $errors[] = "Password must contain at least one lowercase letter";
}
if (!preg_match('/[A-Z]/', $password)) {
    $errors[] = "Password must contain at least one uppercase letter";
}
if (!preg_match('/\d/', $password)) {
    $errors[] = "Password must contain at least one number";
}

// If validation errors exist
if (!empty($errors)) {
    echo json_encode([
        "status" => "error",
        "message" => implode(". ", $errors)
    ]);
    exit();
}

// Check if username already exists
$check_username_sql = "SELECT id FROM users WHERE username = ?";
$check_username_stmt = mysqli_prepare($conn, $check_username_sql);
mysqli_stmt_bind_param($check_username_stmt, "s", $username);
mysqli_stmt_execute($check_username_stmt);
$check_username_result = mysqli_stmt_get_result($check_username_stmt);

if (mysqli_num_rows($check_username_result) > 0) {
    echo json_encode([
        "status" => "error",
        "message" => "Username already taken"
    ]);
    exit();
}

// Check if email already exists
$check_email_sql = "SELECT id FROM users WHERE email = ?";
$check_email_stmt = mysqli_prepare($conn, $check_email_sql);
mysqli_stmt_bind_param($check_email_stmt, "s", $email);
mysqli_stmt_execute($check_email_stmt);
$check_email_result = mysqli_stmt_get_result($check_email_stmt);

if (mysqli_num_rows($check_email_result) > 0) {
    echo json_encode([
        "status" => "error",
        "message" => "Email already registered"
    ]);
    exit();
}

// Hash password securely
$password_hash = password_hash($password, PASSWORD_DEFAULT);

// Insert user
$sql = "INSERT INTO users (username, password_hash, email) VALUES (?, ?, ?)";
$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, "sss", $username, $password_hash, $email);

if (mysqli_stmt_execute($stmt)) {
    echo json_encode([
        "status" => "success",
        "message" => "User registered successfully",
        "user" => $username
    ]);
    
} else {
    echo json_encode([
        "status" => "error",
        "message" => "Registration failed. Please try again."
    ]);
}

mysqli_close($conn);
?>