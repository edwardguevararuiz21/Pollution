<?php
session_start();

// 🔥 HEADERS MEJORADOS PARA CORS Y SEGURIDAD
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// ---- CONFIGURACIÓN DE ERRORES ----
error_reporting(E_ALL);
ini_set('display_errors', 0); // No mostrar errores al usuario
ini_set('log_errors', 1);
ini_set('error_log', 'php_errors.log');

// ---- CONEXIÓN A BASE DE DATOS ----
$host = "localhost";
$usuario = "root";
$password = "";
$basedatos = "holmerroncancio_edwardguevara";

$conexion = new mysqli($host, $usuario, $password, $basedatos);

if ($conexion->connect_error) {
    error_log("Error de conexión a BD: " . $conexion->connect_error);
    echo json_encode([
        "exito" => false, 
        "mensaje" => "Error de conexión a la base de datos. Intente más tarde.",
        "error_code" => "DB_CONNECTION_FAILED"
    ]);
    exit;
}

// ---- FUNCIÓN DE VALIDACIÓN ----
function validarDatos($datos) {
    $errores = [];
    
    // Validar email
    if (!empty($datos['email']) && !filter_var($datos['email'], FILTER_VALIDATE_EMAIL)) {
        $errores[] = "El formato del email no es válido.";
    }
    
    // Validar nombre (solo letras y espacios)
    if (!empty($datos['nombre']) && !preg_match('/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/', $datos['nombre'])) {
        $errores[] = "El nombre solo puede contener letras y espacios (2-50 caracteres).";
    }
    
    // Validar teléfono (opcional)
    if (!empty($datos['telefono']) && !preg_match('/^[0-9+\-\s]{10,15}$/', $datos['telefono'])) {
        $errores[] = "El formato del teléfono no es válido.";
    }
    
    // Validar contraseña
    if (!empty($datos['password']) && strlen($datos['password']) < 6) {
        $errores[] = "La contraseña debe tener al menos 6 caracteres.";
    }
    
    return $errores;
}

// ---- RECIBIR Y LIMPIAR DATOS ----
$nombre   = trim($_POST['nombre'] ?? '');
$apellido = trim($_POST['apellido'] ?? '');
$telefono = trim($_POST['telefono'] ?? '');
$email    = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';

// Limpiar datos
$nombre   = $conexion->real_escape_string($nombre);
$apellido = $conexion->real_escape_string($apellido);
$telefono = $conexion->real_escape_string($telefono);
$email    = $conexion->real_escape_string($email);

// ---- VALIDAR DATOS ----
$erroresValidacion = validarDatos([
    'nombre' => $nombre,
    'email' => $email,
    'telefono' => $telefono,
    'password' => $password
]);

if (!empty($erroresValidacion)) {
    echo json_encode([
        "exito" => false, 
        "mensaje" => implode(" ", $erroresValidacion),
        "error_code" => "VALIDATION_ERROR"
    ]);
    $conexion->close();
    exit;
}

// ---- VERIFICAR SI ES LOGIN O REGISTRO ----
if (!empty($email) && !empty($password) && empty($nombre)) {
    // ---- PROCESAR LOGIN ----
    procesarLogin($conexion, $email, $password);
    
} else {
    // ---- PROCESAR REGISTRO ----
    procesarRegistro($conexion, $nombre, $apellido, $telefono, $email, $password);
}

// ---- FUNCIÓN PARA LOGIN ----
function procesarLogin($conexion, $email, $password) {
    $stmt = $conexion->prepare("SELECT id, nombre, apellido, email, password, fecha_registro FROM usuarios WHERE email = ? AND activo = 1");
    
    if (!$stmt) {
        error_log("Error preparando consulta login: " . $conexion->error);
        echo json_encode([
            "exito" => false, 
            "mensaje" => "Error interno del servidor.",
            "error_code" => "PREPARE_STMT_ERROR"
        ]);
        return;
    }
    
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $stmt->store_result();
    $stmt->bind_result($id_db, $nombre_db, $apellido_db, $email_db, $password_db, $fecha_registro);

    if ($stmt->num_rows > 0) {
        $stmt->fetch();
        
        if (password_verify($password, $password_db)) {
            // Actualizar última conexión
            $update_stmt = $conexion->prepare("UPDATE usuarios SET ultima_conexion = NOW() WHERE id = ?");
            $update_stmt->bind_param("i", $id_db);
            $update_stmt->execute();
            $update_stmt->close();
            
            // Configurar sesión
            $_SESSION['usuario_id'] = $id_db;
            $_SESSION['usuario_nombre'] = $nombre_db;
            $_SESSION['usuario_email'] = $email_db;
            $_SESSION['login_time'] = time();

            echo json_encode([
                "exito" => true, 
                "nombre" => $nombre_db,
                "id" => $id_db,
                "email" => $email_db,
                "apellido" => $apellido_db,
                "telefono" => "", // Agregar si lo tienes en la BD
                "fecha_registro" => $fecha_registro,
                "esLogin" => true,
                "mensaje" => "Login exitoso. Bienvenido de nuevo."
            ]);
            
            error_log("Login exitoso para usuario: $email");
            
        } else {
            echo json_encode([
                "exito" => false, 
                "mensaje" => "Contraseña incorrecta.",
                "error_code" => "INVALID_PASSWORD"
            ]);
            error_log("Intento de login con contraseña incorrecta para: $email");
        }
    } else {
        echo json_encode([
            "exito" => false, 
            "mensaje" => "No existe una cuenta activa con este correo.",
            "error_code" => "USER_NOT_FOUND"
        ]);
        error_log("Intento de login con email no registrado: $email");
    }
    
    $stmt->close();
}

// ---- FUNCIÓN PARA REGISTRO ----
function procesarRegistro($conexion, $nombre, $apellido, $telefono, $email, $password) {
    // Verificar campos obligatorios
    if(empty($nombre) || empty($email) || empty($password)){
        echo json_encode([
            "exito" => false, 
            "mensaje" => "Todos los campos obligatorios deben ser completados.",
            "error_code" => "MISSING_FIELDS"
        ]);
        return;
    }

    // Verificar si el email ya existe
    $stmt = $conexion->prepare("SELECT id, nombre, activo FROM usuarios WHERE email = ?");
    
    if (!$stmt) {
        error_log("Error preparando consulta registro: " . $conexion->error);
        echo json_encode([
            "exito" => false, 
            "mensaje" => "Error interno del servidor.",
            "error_code" => "PREPARE_STMT_ERROR"
        ]);
        return;
    }
    
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $stmt->store_result();
    $stmt->bind_result($id_db, $nombre_db, $activo_db);

    if ($stmt->num_rows > 0) {
        $stmt->fetch();
        
        if ($activo_db) {
            // Email ya existe y está activo, hacer login automático
            $_SESSION['usuario_id'] = $id_db;
            $_SESSION['usuario_nombre'] = $nombre_db;
            $_SESSION['usuario_email'] = $email;
            $_SESSION['login_time'] = time();

            echo json_encode([
                "exito" => true, 
                "nombre" => $nombre_db,
                "id" => $id_db,
                "email" => $email,
                "esLogin" => true,
                "mensaje" => "El email ya estaba registrado. Se ha iniciado sesión automáticamente."
            ]);
            
            error_log("Registro fallido - email existente, login automático: $email");
            
        } else {
            echo json_encode([
                "exito" => false, 
                "mensaje" => "Esta cuenta ha sido desactivada. Contacta al administrador.",
                "error_code" => "ACCOUNT_DISABLED"
            ]);
        }
    } else {
        // Crear nueva cuenta
        $password_hash = password_hash($password, PASSWORD_BCRYPT);
        $ins = $conexion->prepare("INSERT INTO usuarios (nombre, apellido, telefono, email, password, fecha_registro, activo) VALUES (?, ?, ?, ?, ?, NOW(), 1)");
        
        if (!$ins) {
            error_log("Error preparando inserción: " . $conexion->error);
            echo json_encode([
                "exito" => false, 
                "mensaje" => "Error al crear la cuenta. Intente más tarde.",
                "error_code" => "INSERT_STMT_ERROR"
            ]);
            return;
        }
        
        $ins->bind_param("sssss", $nombre, $apellido, $telefono, $email, $password_hash);

        if ($ins->execute()) {
            $nuevo_id = $ins->insert_id;
            
            // Configurar sesión
            $_SESSION['usuario_id'] = $nuevo_id;
            $_SESSION['usuario_nombre'] = $nombre;
            $_SESSION['usuario_email'] = $email;
            $_SESSION['login_time'] = time();

            echo json_encode([
                "exito" => true, 
                "nombre" => $nombre,
                "id" => $nuevo_id,
                "email" => $email,
                "apellido" => $apellido,
                "telefono" => $telefono,
                "esLogin" => false,
                "mensaje" => "Usuario registrado correctamente. ¡Bienvenido!"
            ]);
            
            error_log("Nuevo usuario registrado: $email (ID: $nuevo_id)");
            
        } else {
            error_log("Error ejecutando inserción: " . $ins->error);
            echo json_encode([
                "exito" => false, 
                "mensaje" => "No se pudo crear la cuenta. Intente nuevamente.",
                "error_code" => "EXECUTE_INSERT_ERROR"
            ]);
        }

        $ins->close();
    }

    $stmt->close();
}

// ---- CERRAR CONEXIÓN ----
$conexion->close();
?>