document.addEventListener("DOMContentLoaded", () => {
  const siguienteBtn = document.getElementById("siguienteBtn");
  const mensajeMascota = document.getElementById("mensajeMascota");
  const mascotaIntro = document.getElementById("mascotaIntro");
  const barra = document.getElementById("barraProgreso");
  const textoProgreso = document.getElementById("textoProgreso");

  let progreso = 0;
  const maxProgreso = 10;

  const viñetas = [
    "¡Hola! Soy EcoGatito 🐱 y te guiaré en esta misión ecológica.",
    "Primero conoceremos datos curiosos 🌱, luego veremos videos 🎥 y por último descargaremos recursos 📚.",
    "Cada cosa que aprendas llenará tu barra de progreso ✅.",
    "¡Completa la barra para desbloquear la sopa de letras! 🔠"
  ];
  let vIndex = 0;
  escribirTexto(viñetas[vIndex]);

  siguienteBtn.addEventListener("click", () => {
    vIndex++;
    if (vIndex < viñetas.length) {
      escribirTexto(viñetas[vIndex]);
    } else {
      mascotaIntro.style.display = "none";
    }
  });

  function escribirTexto(texto) {
    let i = 0;
    mensajeMascota.innerHTML = "";
    const intervalo = setInterval(() => {
      mensajeMascota.innerHTML += texto.charAt(i);
      i++;
      if (i >= texto.length) clearInterval(intervalo);
    }, 30);
  }

  function aumentarProgreso() {
    if (progreso < maxProgreso) {
      progreso++;
      let porcentaje = (progreso / maxProgreso) * 100;
      barra.style.width = porcentaje + "%";
      textoProgreso.textContent = `${progreso} / ${maxProgreso} completado`;

      if (progreso === maxProgreso) {
        mostrarMascota(
          "🎉 ¡Lo lograste! Ahora acompáñame a la sopa de letras para seguir aprendiendo. 🧩",
          true
        );
      }
    }
  }

  function mostrarMascota(texto, final = false) {
    mascotaIntro.style.display = "block";
    escribirTexto(texto);
    siguienteBtn.onclick = () => {
      mascotaIntro.style.display = "none";
      if (final) window.location.href = "sopa de letras.html";
    };
  }

  // Videos: mostrar iframe y reproducir al botón
  document.querySelectorAll(".startVideo").forEach(btn => {
    btn.addEventListener("click", function() {
      const iframe = this.nextElementSibling;
      
      // Verificar si ya está activo para no sumar progreso múltiples veces
      if (!iframe.classList.contains('activo')) {
        iframe.classList.add('activo');
        
        let url = iframe.src;
        if (!url.includes("autoplay=1")) {
          iframe.src = url + (url.includes("?") ? "&" : "?") + "autoplay=1";
        }
        
        // Cambiar el texto del botón para indicar que ya se activó
        this.textContent = "✅ Activado";
        this.disabled = true;
        this.style.backgroundColor = "#4CAF50";
        
        aumentarProgreso();
      }
    });
  });

  // Recursos suman progreso
  document.querySelectorAll(".recursos a").forEach(link => {
    link.addEventListener("click", () => {
      aumentarProgreso();
    });
  });

  // Curiosidades suman progreso - SOLO UNA VEZ POR CURIOSIDAD
  const btnPrev = document.getElementById("btnPrev");
  const btnNext = document.getElementById("btnNext");
  const curiosidadBox = document.getElementById("curiosidadBox");
  
  let curiosidadesVistas = new Set(); // Para llevar registro de las curiosidades ya vistas
  
  function manejarCuriosidad() {
    const curiosidadActual = curiosidadBox.textContent;
    
    // Si esta curiosidad no ha sido vista antes, suma progreso
    if (!curiosidadesVistas.has(curiosidadActual)) {
      curiosidadesVistas.add(curiosidadActual);
      aumentarProgreso();
    }
  }

  btnPrev.addEventListener("click", manejarCuriosidad);
  btnNext.addEventListener("click", manejarCuriosidad);
});