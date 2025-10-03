<?php
session_start();
require 'conexion.php';

if (!isset($_SESSION['id_usuario'])) {
    http_response_code(403);
    echo json_encode(["error" => "Debes iniciar sesión"]);
    exit;
}

$id_usuario = $_SESSION['id_usuario'];

$sql = "SELECT estado FROM partidas WHERE id_usuario = ? ORDER BY fecha DESC LIMIT 1";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id_usuario);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    header('Content-Type: application/json');
    echo $row['estado'];
} else {
    echo json_encode(["error" => "No tienes partidas guardadas"]);
}
