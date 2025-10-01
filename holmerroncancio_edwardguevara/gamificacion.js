/*******************************************
  Gamificación — Pollution Educativo
  - Maneja puntos, barra de progreso y logros
  - Da puntos por:
    • Pasar curiosidades
    • Ver videos (clic en enlace)
    • Completar retos
********************************************/

let puntos = 0;
let logros = new Set();

const progresoEl = document.getElementById("progreso");
const puntosTxt = document.getElementById("puntosTxt");
const logrosEl = document.getElementById("logros");
const listaRetos = document.getElementById("listaRetos");

// Actualiza UI
function actualizarPuntos(cantidad = 0) {
  puntos += cantidad;
  if (puntos < 0) puntos = 0;

  // progreso máximo 100
  let progreso = Math.min(100, (puntos / 50) * 100);
  progresoEl.value = progreso;

  puntosTxt.textContent = `Puntos: ${puntos}`;
  verificarLogros();
}

// Verifica logros alcanzados
function verificarLogros() {
  if (puntos >= 10 && !logros.has("Amigo del Planeta")) {
    agregarLogro("🌟 Amigo del Planeta", "Por leer 10 curiosidades");
  }
  if (puntos >= 20 && !logros.has("Protector de animales")) {
    agregarLogro("🐢 Protector de animales", "Por aprender sobre el agua");
  }
  if (puntos >= 30 && !logros.has("Maestro de Energía")) {
    agregarLogro("⚡ Maestro de Energía", "Por ver 3 videos");
  }
}

// Agrega logro a la lista
function agregarLogro(nombre, desc) {
  logros.add(nombre);
  const li = document.createElement("li");
  li.textContent = `${nombre} — ${desc}`;
  logrosEl.appendChild(li);
}

// 📌 Eventos para sumar puntos

// Botones de curiosidades
const btnPrev = document.getElementById("btnPrev");
const btnNext = document.getElementById("btnNext");
if (btnPrev && btnNext) {
  [btnPrev, btnNext].forEach(btn => {
    btn.addEventListener("click", () => actualizarPuntos(1));
  });
}

// Enlaces de videos
document.querySelectorAll(".video-links a").forEach(link => {
  link.addEventListener("click", () => actualizarPuntos(2));
});

// Retos en casa
if (listaRetos) {
  listaRetos.querySelectorAll("input[type='checkbox']").forEach(chk => {
    chk.addEventListener("change", () => {
      if (chk.checked) {
        actualizarPuntos(3);
      } else {
        actualizarPuntos(-3);
      }
    });
  });
}

// Inicializa
actualizarPuntos(0);
