<?php
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
?>