<?php 
session_start();
$usuario_nombre = $_SESSION['usuario_nombre'] ?? '';
?>
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Pollution — Inicio / Educativo</title>
<link rel="stylesheet" href="estilos.css">
<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@500&display=swap" rel="stylesheet">
</head>
<body>

<header>
  <img src="img/baner.png" alt="Banner" class="banner">
  <div class="header-texto">
    <h1>🌍 Pollution: Aprende y juega cuidando el planeta</h1>
    <p>Conviértete en un héroe ecológico mientras te diviertes 💚</p>
  </div>
  <nav>
    <ul>
      <li><a href="index.php">🏠 Inicio</a></li>
      <li><a href="Productos.php">🛠 Productos</a></li>
      <li><a href="educativo.php">📚 Educativo</a></li>
      <li><a href="CrearCuenta.php">📝 Crear Cuenta</a></li>
      <li><a href="sopa.php">🔠 Sopa de letras</a></li>
      <li><a href="Crucigrama.php">🔤 Crucigrama</a></li>
      <li><a href="Juego.php">🎮 Juego</a></li>
      <li><a href="Evaluacion.php">📄 Evaluación</a></li>
    </ul>
  </nav>
</header>

<section class="mascota-intro" id="mascotaIntro">
  <div class="mascota-box">
    <img src="img/mascota.png" alt="EcoGatito" class="eco-mascota">
    <div class="bocadillo" id="mensajeMascota" aria-live="polite"></div>
    <button id="siguienteBtn">➡️ Continuar</button>
  </div>
</section>

<section class="presentacion" id="presentacion" style="display:none;">
  <h2>👋 Bienvenido a Pollution</h2>
  <p>Aprende sobre <strong>energías limpias</strong>, reciclaje y cuidado del agua 🌱. Todo con juegos y actividades divertidas, ¡ideal para niños de 8 a 12 años!</p>
</section>

<section class="carrusel" id="carruselSeccion" style="display:none;">
  <div id="carruselContainer" class="carrusel-container"></div>
</section>

<section class="historietas" id="historietasSeccion" style="display:none;">
  <div class="mascota-box">
    <img src="img/mascota.png" alt="EcoGatito" class="eco-mascota">
    <div class="bocadillo" id="mensajeHistorieta" aria-live="polite"></div>
    <div id="ilustracionHistorieta" class="ilustracion"></div>
    <button id="siguienteHistorietaBtn">➡️ Siguiente</button>
  </div>
</section>

<footer>
  <p>&copy; 2025 - Pollution | Energías Limpias para Niños 🌱</p>
</footer>

<script>
const usuarioNombre = "<?php echo $usuario_nombre; ?>";
</script>
<script src="script.js"></script>
</body>
</html>
