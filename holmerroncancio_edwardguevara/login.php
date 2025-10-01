<?php
session_start();
header('Content-Type: application/json');

// ---- CONEXIÓN A BASE DE DATOS ----
$conexion = new mysqli("localhost", "root", "", "holmerroncancio_edwardguevara");
if ($conexion->connect_error) {
    echo json_encode(["exito" => false, "mensaje" => "Error de conexión a la base de datos."]);
    exit;
}

// ---- RECIBIR DATOS ----
$email = $_POST['email'] ?? '';
$password = $_POST['password'] ?? '';

// Validar campos
if (empty($email) || empty($password)) {
    echo json_encode(["exito" => false, "mensaje" => "Todos los campos son obligatorios."]);
    exit;
}

// ---- VERIFICAR CREDENCIALES ----
$stmt = $conexion->prepare("SELECT id, nombre, apellido, email, password FROM usuarios WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$stmt->store_result();
$stmt->bind_result($id, $nombre, $apellido, $email_db, $password_hash);

if ($stmt->num_rows === 1) {
    $stmt->fetch();
    
    // Verificar contraseña
    if (password_verify($password, $password_hash)) {
        // Guardar en sesión
        $_SESSION['usuario_id'] = $id;
        $_SESSION['usuario_nombre'] = $nombre;
        $_SESSION['usuario_email'] = $email_db;
        
        // Respuesta exitosa
        echo json_encode([
            "exito" => true, 
            "mensaje" => "Login exitoso",
            "id" => $id,
            "nombre" => $nombre,
            "email" => $email_db
        ]);
        
    } else {
        echo json_encode(["exito" => false, "mensaje" => "Contraseña incorrecta."]);
    }
} else {
    echo json_encode(["exito" => false, "mensaje" => "No existe una cuenta con este correo."]);
}

$stmt->close();
$conexion->close();
exit;
?>