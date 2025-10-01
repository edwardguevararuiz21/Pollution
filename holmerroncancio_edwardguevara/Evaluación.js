document.addEventListener("DOMContentLoaded", () => { 
  // Elementos
  const textoMascota = document.getElementById("textoMascota");        // intro
  const btnSiguiente = document.getElementById("btnSiguiente");
  const mascotaIntro = document.getElementById("mascotaIntro");
  const evaluacion = document.getElementById("evaluacion");

  const mascotaEvalArea = document.getElementById("mascotaEvalArea");
  const textoMascotaEval = document.getElementById("textoMascotaEval"); // para pistas durante la evaluación

  // --- Máquina de escribir ---
  let typingInterval = null;
  function escribirTexto(texto = "", callback = null, targetEl = textoMascota) {
    if (typingInterval) {
      clearInterval(typingInterval);
      typingInterval = null;
    }
    if (!targetEl) return;
    targetEl.textContent = "";
    let i = 0;
    if (targetEl === textoMascotaEval && mascotaEvalArea) {
      mascotaEvalArea.style.display = "block";
    }
    typingInterval = setInterval(() => {
      targetEl.textContent += texto.charAt(i) || "";
      i++;
      if (i > texto.length) {
        clearInterval(typingInterval);
        typingInterval = null;
        if (typeof callback === "function") callback();
      }
    }, 30);
  }

  // --- Intro mensajes personalizados ---
  const introMessages = [
    (function() {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      const guestMode = localStorage.getItem("guestMode") === "true";
      if (currentUser) {
        return `¡Hola ${currentUser.nombre}! Soy EcoGatito 🐱`;
      } else if (guestMode) {
        return "¡Hola amigo! Soy EcoGatito 🐱";
      } else {
        return "¡Hola! Soy EcoGatito 🐱";
      }
    })(),
    "Llegó el momento de comprobar cuánto aprendiste 📚",
    "Te haré 10 preguntas sobre energías limpias.",
    "Si aciertas al menos el 60% podrás pasar a la siguiente misión.",
    "Pulsa Siguiente para continuar. ¡Tú puedes! 😺"
  ];
  let step = 0;
  escribirTexto(introMessages[0], () => { step = 1; }, textoMascota);

  btnSiguiente.addEventListener("click", () => {
    if (step > 0 && step < introMessages.length) {
      escribirTexto(introMessages[step], () => { step++; }, textoMascota);
      if (step === introMessages.length - 1) {
        btnSiguiente.textContent = "🎮 Prepararme";
      }
      return;
    }
    if (step >= introMessages.length) {
      mascotaIntro.style.display = "none";
      evaluacion.style.display = "block";
      escribirTexto("¡Listo! Si necesitas una pista pulsa el botón 💡 junto a la pregunta.", null, textoMascotaEval);
      return;
    }
  });

  /* ---------------------------- */
  /* Preguntas (10) con pistas    */
  /* ---------------------------- */
  const preguntas = [
    { texto: "1. ¿Cuál es una fuente de energía renovable?", opciones: ["Carbón", "Solar ☀️", "Petróleo"], respuesta: 1, pista: "La usamos con paneles solares." },
    { texto: "2. ¿Qué energía viene del viento?", opciones: ["Eólica 🌬️", "Hidráulica 💧", "Nuclear"], respuesta: 0, pista: "Mira los molinos en el campo." },
    { texto: "3. ¿Cuál contamina menos el aire?", opciones: ["Quemar carbón", "Energía solar ☀️", "Usar petróleo"], respuesta: 1, pista: "No produce humo ni gases." },
    { texto: "4. ¿Qué energía usan las represas?", opciones: ["Hidráulica 💧", "Eólica 🌬️", "Geotérmica 🌋"], respuesta: 0, pista: "Proviene del agua en movimiento." },
    { texto: "5. La energía del calor de la Tierra es:", opciones: ["Solar ☀️", "Geotérmica 🌋", "Eólica 🌬️"], respuesta: 1, pista: "Se usa cerca de volcanes y aguas termales." },
    { texto: "6. ¿Qué ventaja tienen las energías limpias?", opciones: ["Se acaban rápido", "Son renovables y no contaminan", "Producen humo"], respuesta: 1, pista: "Ayudan al planeta y no generan tanto CO₂." },
    { texto: "7. ¿Cuál de estas usa energía solar?", opciones: ["Molino de viento", "Calentador con panel solar", "Fábrica de carbón"], respuesta: 1, pista: "Funciona con los rayos del sol." },
    { texto: "8. ¿Por qué usar energías limpias?", opciones: ["Cuidan el planeta 🌍", "Son más contaminantes", "Destruyen la naturaleza"], respuesta: 0, pista: "Es la opción que protege la Tierra." },
    { texto: "9. ¿Qué energía es ideal en zonas con mucho viento?", opciones: ["Eólica 🌬️", "Solar ☀️", "Nuclear"], respuesta: 0, pista: "Molinos gigantes giran con ella." },
    { texto: "10. Para reducir la contaminación, una ciudad debe usar más:", opciones: ["Energías renovables", "Carbón y petróleo", "Autos de gasolina"], respuesta: 0, pista: "La opción más limpia y sostenible." }
  ];

  // DOM evaluación
  const form = document.getElementById("quizForm");
  const progressBar = document.getElementById("progressBar");
  const progressText = document.getElementById("progressText");
  const resultado = document.getElementById("resultado");
  const submitBtn = document.getElementById("submitBtn");
  const resetBtn = document.getElementById("resetBtn");

  // Generar preguntas
  function generarPreguntas() {
    form.innerHTML = "";
    preguntas.forEach((p, i) => {
      const qDiv = document.createElement("div");
      qDiv.className = "question";
      qDiv.id = `q-${i}`;

      const pElem = document.createElement("p");
      pElem.textContent = p.texto;
      qDiv.appendChild(pElem);

      const opcionesDiv = document.createElement("div");
      opcionesDiv.className = "options";

      p.opciones.forEach((opt, j) => {
        const id = `q${i}_opt${j}`;
        const label = document.createElement("label");
        label.htmlFor = id;

        const input = document.createElement("input");
        input.type = "radio";
        input.name = `q${i}`;
        input.value = j;
        input.id = id;
        input.addEventListener("change", actualizarProgreso);

        const span = document.createElement("span");
        span.textContent = opt;

        label.appendChild(input);
        label.appendChild(span);
        opcionesDiv.appendChild(label);
      });

      qDiv.appendChild(opcionesDiv);

      // Botón pista (usa mascota)
      const pistaBtn = document.createElement("button");
      pistaBtn.type = "button";
      pistaBtn.textContent = "💡 Pista";
      pistaBtn.className = "pista-btn";
      pistaBtn.addEventListener("click", () => {
        escribirTexto(p.pista, null, textoMascotaEval);
      });
      qDiv.appendChild(pistaBtn);

      form.appendChild(qDiv);
    });
    actualizarProgreso();
  }

  // Progreso
  function actualizarProgreso() {
    const total = preguntas.length;
    let respondidas = 0;
    for (let i = 0; i < total; i++) {
      if (document.querySelector(`input[name="q${i}"]:checked`)) respondidas++;
    }
    progressText.textContent = `${respondidas} / ${total} respondidas`;
    progressBar.style.width = Math.round((respondidas / total) * 100) + "%";
  }

  // Guardar resultados de evaluación
  function guardarResultadosEvaluacion(correctas, total) {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    
    if (!currentUser) {
      console.log("Modo invitado: resultados no guardados");
      return;
    }

    const statsKey = `userStats_${currentUser.email}`;
    const stats = JSON.parse(localStorage.getItem(statsKey)) || {
      juegosCompletados: 0,
      puntosTotales: 0,
      tiempoJugado: 0,
      evaluaciones: []
    };

    const nuevaEvaluacion = {
      correctas: correctas,
      total: total,
      porcentaje: Math.round((correctas / total) * 100),
      fecha: new Date().toLocaleDateString('es-ES'),
      timestamp: new Date().toISOString()
    };

    // Agregar nueva evaluación
    stats.evaluaciones.push(nuevaEvaluacion);
    
    // Limitar a las últimas 10 evaluaciones
    if (stats.evaluaciones.length > 10) {
      stats.evaluaciones = stats.evaluaciones.slice(-10);
    }

    // Sumar puntos por evaluación completada
    stats.puntosTotales += correctas * 10; // 10 puntos por respuesta correcta
    
    localStorage.setItem(statsKey, JSON.stringify(stats));
    
    console.log(`Resultados guardados para ${currentUser.nombre}: ${correctas}/${total}`);
  }

  // Revisar respuestas
  function revisar() {
    let correctas = 0;
    preguntas.forEach((p, i) => {
      const qDiv = document.getElementById(`q-${i}`);
      qDiv.classList.remove("correct", "wrong");
      const sel = document.querySelector(`input[name="q${i}"]:checked`);
      if (sel && parseInt(sel.value) === p.respuesta) {
        correctas++;
        qDiv.classList.add("correct");
      } else {
        qDiv.classList.add("wrong");
      }
    });

    const total = preguntas.length;
    
    // Guardar resultados si es usuario registrado
    guardarResultadosEvaluacion(correctas, total);

    if (correctas >= Math.ceil(total * 0.6)) {
      // ✅ EcoGatito invita con el link
      escribirTexto(
        `🎉 Muy bien, acertaste ${correctas}/${total}. Ahora que sabes lo teórico, ¡vamos a ponerlo en práctica en el juego!`,
        () => {
          // después del texto, añadimos el link como botón
          const linkBtn = document.createElement("a");
          linkBtn.href = "Juego.html";
          linkBtn.textContent = "👉 Ir al Juego";
          linkBtn.className = "btn-siguiente";
          textoMascotaEval.appendChild(document.createElement("br"));
          textoMascotaEval.appendChild(linkBtn);
        },
        textoMascotaEval
      );
    } else {
      escribirTexto(
        `😿 Solo ${correctas}/${total}. ¡No te preocupes! Puedes intentarlo otra vez y yo te ayudo.`,
        null,
        textoMascotaEval
      );
      resultado.textContent = `Has obtenido ${correctas} de ${total}. ¡Inténtalo de nuevo para mejorar!`;
    }
    
    // Mostrar resultado detallado
    resultado.innerHTML = `
      <div class="resultado-detalle">
        <h3>📊 Resultado Final</h3>
        <p>✅ Correctas: ${correctas}</p>
        <p>❌ Incorrectas: ${total - correctas}</p>
        <p>📈 Porcentaje: ${Math.round((correctas / total) * 100)}%</p>
        ${correctas >= Math.ceil(total * 0.6) ? 
          '<p class="aprobado">🎉 ¡Aprobado! Puedes continuar al juego.</p>' : 
          '<p class="reprobado">😿 Necesitas al menos 60% para pasar.</p>'
        }
      </div>
    `;
    
    if (mascotaEvalArea) mascotaEvalArea.style.display = "block";
  }

  // Reiniciar
  function reiniciar() {
    preguntas.forEach((p, i) => {
      const checked = document.querySelector(`input[name="q${i}"]:checked`);
      if (checked) checked.checked = false;
      const qDiv = document.getElementById(`q-${i}`);
      if (qDiv) {
        qDiv.classList.remove("correct", "wrong");
      }
    });
    resultado.textContent = "";
    progressBar.style.width = "0%";
    progressText.textContent = `0 / ${preguntas.length} respondidas`;
    if (textoMascotaEval) textoMascotaEval.textContent = "";
  }

  // Eventos
  submitBtn.addEventListener("click", revisar);
  resetBtn.addEventListener("click", reiniciar);

  generarPreguntas();
});