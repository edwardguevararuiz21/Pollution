<?php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Conexión a base de datos
$conexion = new mysqli("localhost", "root", "", "holmerroncancio_edwardguevara");
if ($conexion->connect_error) {
    echo json_encode(["success" => false, "message" => "Error de conexión"]);
    exit;
}

// Leer datos JSON
$input = json_decode(file_get_contents('php://input'), true);
$usuario_id = $input['usuario_id'] ?? null;
$game_data = $input['game_data'] ?? null;

if (!$usuario_id || !$game_data) {
    echo json_encode(["success" => false, "message" => "Datos incompletos"]);
    exit;
}

// Guardar partida en base de datos
$stmt = $conexion->prepare("INSERT INTO partidas_guardadas (usuario_id, game_data, fecha_guardado) VALUES (?, ?, NOW())");
$game_data_json = json_encode($game_data);
$stmt->bind_param("is", $usuario_id, $game_data_json);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Partida guardada"]);
} else {
    echo json_encode(["success" => false, "message" => "Error al guardar"]);
}

$stmt->close();
$conexion->close();
?>