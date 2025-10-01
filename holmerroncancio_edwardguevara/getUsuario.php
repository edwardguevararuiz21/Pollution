<?php
session_start();
header('Content-Type: application/json');

if (isset($_SESSION['nombre'])) {
    echo json_encode(["nombre" => $_SESSION['nombre']]);
} else {
    echo json_encode(["nombre" => null]);
}
