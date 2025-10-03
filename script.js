// Datos de energías limpias (ahora más completas)
const energias = [
  { nombre: "☀️ Solar", descripcion: "Usa la luz del sol para generar energía.", img: "img/solar-panels-8593759_640.png" },
  { nombre: "💨 Eólica", descripcion: "Aprovecha el viento para producir electricidad.", img: "img/windmills-311837_640.png" },
{ nombre: "💧 Hidráulica", descripcion: "Utiliza la fuerza del agua en movimiento.", img: "img/button-161555_640.png" },
  { nombre: "🌊 Mareomotriz", descripcion: "Aprovecha el movimiento de las mareas.", img: "img/wind-turbine-5163993_640.jpg" },
  { nombre: "🌊 Undimotriz", descripcion: "Usa la energía de las olas del mar.", img: "img/seagull-7477585_640.jpg" },
  { nombre: "🌋 Geotérmica", descripcion: "Usa el calor del interior de la Tierra.", img: "img/ai-generated.jpg" },
  { nombre: "🌱 Biomasa", descripcion: "Genera energía usando materia orgánica.", img: "img/paint-2090112_640.jpg" },
  { nombre: "🔥 Biogás", descripcion: "Gas renovable producido a partir de desechos.", img: "img/biogas.png" },
  { nombre: "⚗️ Hidrógeno Verde", descripcion: "Hidrógeno producido con energía renovable.", img: "img/hydrogen-6222031_640.jpg" }
];

// Mostrar energías
const contenedor = document.getElementById("energia-contenedor");
energias.forEach(e => {
  let div = document.createElement("div");
  div.className = "energia-item";
  div.innerHTML = `<img src="${e.img}" width="120"><h3>${e.nombre}</h3><p>${e.descripcion}</p>`;
  contenedor.appendChild(div);
});

// Mini juego con más preguntas
let preguntas = [
  { pregunta: "¿Cuál usa el viento?", opciones: ["Solar", "Eólica", "Hidráulica"], respuesta: "Eólica" },
  { pregunta: "¿Cuál aprovecha el agua de ríos?", opciones: ["Hidráulica", "Solar", "Geotérmica"], respuesta: "Hidráulica" },
  { pregunta: "¿Cuál usa la luz del sol?", opciones: ["Solar", "Eólica", "Biogás"], respuesta: "Solar" },
  { pregunta: "¿Cuál usa el calor del interior de la Tierra?", opciones: ["Geotérmica", "Mareomotriz", "Solar"], respuesta: "Geotérmica" },
  { pregunta: "¿Cuál se produce con el movimiento de las olas?", opciones: ["Undimotriz", "Eólica", "Solar"], respuesta: "Undimotriz" },
  { pregunta: "¿Cuál usa el movimiento de las mareas?", opciones: ["Mareomotriz", "Hidráulica", "Biomasa"], respuesta: "Mareomotriz" },
  { pregunta: "¿Cuál se obtiene de plantas y restos orgánicos?", opciones: ["Biomasa", "Biogás", "Solar"], respuesta: "Biomasa" },
  { pregunta: "¿Cuál es un gas renovable producido de desechos?", opciones: ["Biogás", "Hidrógeno Verde", "Eólica"], respuesta: "Biogás" },
  { pregunta: "¿Cuál es un combustible limpio hecho con energía renovable?", opciones: ["Hidrógeno Verde", "Mareomotriz", "Hidráulica"], respuesta: "Hidrógeno Verde" }
];

let puntaje = 0;
let preguntaActual = 0;
let tiempoRestante = 10;
let temporizador;

// Sonidos
const sonidoCorrecto = new Audio("sounds/correcto.mp3");
const sonidoIncorrecto = new Audio("sounds/incorrecto.mp3");
const musicaFondo = new Audio("sounds/musica.mp3");
musicaFondo.loop = true;
musicaFondo.volume = 0.3;
musicaFondo.play();

function mostrarPregunta() {
  clearInterval(temporizador);
  tiempoRestante = 10;
  document.getElementById("pregunta").textContent = preguntas[preguntaActual].pregunta;
  document.getElementById("resultado").textContent = "";
  document.getElementById("opciones").innerHTML = "";
  document.getElementById("tiempo").textContent = tiempoRestante;

  preguntas[preguntaActual].opciones.forEach(op => {
    let btn = document.createElement("button");
    btn.textContent = op;
    btn.onclick = () => verificarRespuesta(op);
    document.getElementById("opciones").appendChild(btn);
  });

  temporizador = setInterval(() => {
    tiempoRestante--;
    document.getElementById("tiempo").textContent = tiempoRestante;
    if (tiempoRestante <= 0) {
      clearInterval(temporizador);
      verificarRespuesta(null); // Tiempo agotado
    }
  }, 1000);
}

function verificarRespuesta(op) {
  clearInterval(temporizador);
  let resultado = document.getElementById("resultado");

  if (op === preguntas[preguntaActual].respuesta) {
    puntaje++;
    resultado.textContent = "¡Correcto! 🌟";
    resultado.style.color = "green";
    sonidoCorrecto.play();
  } else if (op === null) {
    resultado.textContent = "⏳ Tiempo agotado...";
    resultado.style.color = "orange";
    sonidoIncorrecto.play();
  } else {
    resultado.textContent = "Ups... intenta de nuevo 😅";
    resultado.style.color = "red";
    sonidoIncorrecto.play();
  }

  document.getElementById("puntaje").textContent = puntaje;
  preguntaActual = (preguntaActual + 1) % preguntas.length;
  setTimeout(mostrarPregunta, 1500);
}

mostrarPregunta();
