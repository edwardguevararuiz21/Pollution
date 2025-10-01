<?php
$host = "localhost";
$usuario = "root";   // o tu usuario de MySQL
$password = "";      // tu contraseña (si tienes)
$basedatos = "holmerroncancio_edwardguevara"; // 👈 tu base real

$conexion = new mysqli($host, $usuario, $password, $basedatos);

if ($conexion->connect_error) {
    die("Error de conexión: " . $conexion->connect_error);
}
?>
