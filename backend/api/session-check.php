<?php
ini_set('session.cookie_lifetime', 86400);
ini_set('session.gc_maxlifetime', 86400);
session_start();
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

if (isset($_SESSION['id'])) {
    echo json_encode([
        "logged_in" => true,
        "user" => [
            "id" => $_SESSION['id'],
            "username" => $_SESSION['username'],
            "email" => isset($_SESSION['email']) ? $_SESSION['email'] : "",
            "role_u" => isset($_SESSION['role_u']) ? $_SESSION['role_u'] : 'user'
        ],
        "session_id" => session_id()
    ]);
} else {
    echo json_encode(["logged_in" => false]);
}

?>