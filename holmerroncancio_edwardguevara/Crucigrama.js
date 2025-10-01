document.addEventListener("DOMContentLoaded", () => {
  // --- SELECTORES (intenta ser flexible si hay varias etiquetas de texto mascota) ---
  const btnSiguiente = document.getElementById("btnSiguiente");
  const mascotaIntro = document.getElementById("mascotaIntro");
  const juego = document.getElementById("juego");
  const crossword = document.getElementById("crossword");
  const horizontalClues = document.getElementById("horizontal-clues");
  const verticalClues = document.getElementById("vertical-clues");
  const checkButton = document.getElementById("check-button");
  const resetButton = document.getElementById("reset-button");
  const messageDiv = document.getElementById("message");

  // puede haber 1 o 2 elementos donde mostrar el texto (intro y/o juego)
  const textoMascotaNodes = Array.from(document.querySelectorAll('#textoMascota, .bocadillo p'));

  const ROWS = 15, COLS = 15;

  // ------------------ palabras (asegurarse que no generan conflictos) ------------------
  const horizontal = [
    { id: 1, clue: "Energía del sol ☀️", answer: "SOLAR", row: 7, col: 5 },
    { id: 2, clue: "Energía del viento 💨", answer: "EOLICA", row: 5, col: 3 },
    { id: 3, clue: "Elemento esencial 💧", answer: "AGUA", row: 9, col: 7 },
    { id: 4, clue: "Corriente de aire 🌬️", answer: "VIENTO", row: 3, col: 4 },
    { id: 5, clue: "Combustible de residuos ♻️", answer: "BIOGAS", row: 11, col: 4 },
    { id: 6, clue: "Convierte luz en energía ⚡", answer: "PANEL", row: 1, col: 6 },
    { id: 7, clue: "Color ecológico 🌿", answer: "VERDE", row: 13, col: 5 }
  ];

  const vertical = [
    { id: 8, clue: "Calor de la Tierra 🌋", answer: "GEOTERMICA", row: 0, col: 5 },
    { id: 9, clue: "Que puede usarse de nuevo 🔁", answer: "RENOVABLE", row: 2, col: 7 },
    { id: 10, clue: "Combustible alternativo ⚗️", answer: "HIDROGENO", row: 4, col: 9 },
    { id: 11, clue: "Olas del mar 🌊", answer: "ONDAS", row: 7, col: 4 },
    { id: 12, clue: "Máquina que convierte energía ⚙️", answer: "TURBINA", row: 5, col: 8 },
    { id: 13, clue: "Entorno natural 🌍", answer: "AMBIENTE", row: 1, col: 3 },
    { id: 14, clue: "Fuerza que impulsa ⚡", answer: "ENERGIA", row: 0, col: 6 },
    { id: 15, clue: "Proceso que renueva ♻️", answer: "SOSTENIBLE", row: 0, col: 9 },
    { id: 16, clue: "Reutilización de materiales ♻️", answer: "RECICLAJE", row: 4, col: 2 },
    { id: 17, clue: "Condición del tiempo 🌦️", answer: "CLIMA", row: 8, col: 10 }
  ];

  // normalizar a mayúsculas y compactar en allWords con dirección
  const allWords = [];
  horizontal.forEach(w => allWords.push({ ...w, answer: w.answer.toUpperCase(), dir: "H", correcto: false }));
  vertical.forEach(w => allWords.push({ ...w, answer: w.answer.toUpperCase(), dir: "V", correcto: false }));

  // ------------------ estructuras del tablero ------------------
  const letterMap = {};       // "r-c" -> letra
  const inputMap = {};        // "r-c" -> input element
  const startNumberMap = {};  // "r-c" -> número de pista
  const cellsToWords = {};    // "r-c" -> [wordObj,...]
  let nextNumber = 1;
  let typingIntervalId = null;

  // ------------------ funciones de escritura (máquina de escribir) ------------------
  function typeToNodes(text, speed = 28, callback) {
    // escribe el mismo texto en todos los nodos de textoMascotaNodes con efecto.
    if (!textoMascotaNodes.length) { if (callback) callback(); return; }
    if (typingIntervalId) clearInterval(typingIntervalId);
    textoMascotaNodes.forEach(n => n.textContent = "");
    let i = 0;
    typingIntervalId = setInterval(() => {
      const current = text.slice(0, i);
      textoMascotaNodes.forEach(n => n.textContent = current);
      i++;
      if (i > text.length) {
        clearInterval(typingIntervalId);
        typingIntervalId = null;
        if (callback) callback();
      }
    }, speed);
  }

  // helper para escribir texto (cancela intervalos previos)
  function escribirMascota(texto) {
    typeToNodes(texto, 28);
  }

  // ------------------ Cargar y guardar progreso ------------------
  function cargarProgreso() {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const guestMode = localStorage.getItem("guestMode") === "true";
    
    if (!currentUser && !guestMode) return;

    const key = currentUser ? `crucigramaProgreso_${currentUser.email}` : 'crucigramaProgreso_guest';
    const progreso = localStorage.getItem(key);
    
    if (progreso) {
      const data = JSON.parse(progreso);
      
      // Restaurar palabras completadas
      data.palabrasCompletadas?.forEach(palabraCompletada => {
        const word = allWords.find(w => w.answer === palabraCompletada);
        if (word) {
          word.correcto = true;
          // Restaurar visualmente
          for (let i = 0; i < word.answer.length; i++) {
            const r = word.dir === "H" ? word.row : word.row + i;
            const c = word.dir === "H" ? word.col + i : word.col;
            const key = `${r}-${c}`;
            const input = inputMap[key];
            if (input) {
              input.value = word.answer[i];
              input.style.color = "#2d7a4b";
              input.style.fontWeight = "bold";
              input.disabled = true;
            }
          }
        }
      });
      
      escribirMascota("🐱 ¡Bienvenido de nuevo! Continuemos con el crucigrama ✨");
    }
  }

  function guardarProgreso() {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const guestMode = localStorage.getItem("guestMode") === "true";
    
    if (!currentUser && !guestMode) return;

    const palabrasCompletadas = allWords
      .filter(w => w.correcto)
      .map(w => w.answer);
    
    const progreso = {
      palabrasCompletadas: palabrasCompletadas,
      fecha: new Date().toISOString(),
      totalPalabras: allWords.length,
      completadas: palabrasCompletadas.length
    };
    
    const key = currentUser ? `crucigramaProgreso_${currentUser.email}` : 'crucigramaProgreso_guest';
    localStorage.setItem(key, JSON.stringify(progreso));
  }

  function guardarEstadisticasJuego(user) {
    const statsKey = `userStats_${user.email}`;
    const stats = JSON.parse(localStorage.getItem(statsKey)) || {
      juegosCompletados: 0,
      puntosTotales: 0,
      tiempoJugado: 0,
      evaluaciones: []
    };
    
    stats.juegosCompletados += 1;
    stats.puntosTotales += 150; // 150 puntos por crucigrama completado
    stats.tiempoJugado += 10; // 10 minutos estimados
    
    localStorage.setItem(statsKey, JSON.stringify(stats));
  }

  // ------------------ construir mapas y numeración ------------------
  function buildMaps() {
    // limpiar
    Object.keys(letterMap).forEach(k => delete letterMap[k]);
    Object.keys(cellsToWords).forEach(k => delete cellsToWords[k]);
    Object.keys(startNumberMap).forEach(k => delete startNumberMap[k]);
    nextNumber = 1;

    // llenar letterMap y cellsToWords
    for (const w of allWords) {
      for (let i = 0; i < w.answer.length; i++) {
        const r = w.dir === "H" ? w.row : w.row + i;
        const c = w.dir === "H" ? w.col + i : w.col;
        const key = `${r}-${c}`;
        letterMap[key] = w.answer[i];
        cellsToWords[key] = cellsToWords[key] || [];
        cellsToWords[key].push(w);
      }
    }

    // asignar números de pista en orden natural (fila, luego columna)
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const key = `${r}-${c}`;
        if (!letterMap[key]) continue;
        // si alguna palabra empieza aquí (fila y columna coinciden con inicio)
        const startsHere = allWords.some(w => w.row === r && w.col === c);
        if (startsHere && !startNumberMap[key]) {
          startNumberMap[key] = nextNumber++;
        }
      }
    }

    // guardar número en cada palabra (facilita orden)
    for (const w of allWords) {
      w.num = startNumberMap[`${w.row}-${w.col}`] || null;
    }
  }

  // ------------------ renderizar tablero ------------------
  function buildGridVisual() {
    crossword.innerHTML = "";
    // construir celdas
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const key = `${r}-${c}`;
        const cell = document.createElement("div");
        cell.className = "cell";

        if (letterMap[key]) {
          const input = document.createElement("input");
          input.maxLength = 1;
          input.dataset.row = r;
          input.dataset.col = c;
          input.style.textTransform = "uppercase";
          // filtrar caracteres no letras (permite A-Z y caracteres comunes en español)
          input.addEventListener("input", () => {
            input.value = (input.value || "").toUpperCase().replace(/[^A-ZÁÉÍÓÚÑÜ]/g, "");
            onCellInput(r, c);
          });
          inputMap[key] = input;
          cell.appendChild(input);

          if (startNumberMap[key]) {
            const span = document.createElement("span");
            span.className = "cell-number";
            span.textContent = startNumberMap[key];
            cell.appendChild(span);
          }
        } else {
          cell.classList.add("black-cell");
        }

        crossword.appendChild(cell);
      }
    }
  }

  // ------------------ renderizar pistas (ordenadas) ------------------
  function renderClues() {
    horizontalClues.innerHTML = "";
    verticalClues.innerHTML = "";

    const horiz = allWords.filter(w => w.dir === "H").slice();
    const vert = allWords.filter(w => w.dir === "V").slice();

    // ordenar por número asignado
    horiz.sort((a,b) => (a.num||999) - (b.num||999));
    vert.sort((a,b) => (a.num||999) - (b.num||999));

    for (const h of horiz) {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${h.num || ''}.</strong> ${h.clue} <em>(${h.answer.length} letras)</em>`;
      if (h.correcto) {
        li.classList.add("completed");
        li.innerHTML = `✅ ${li.innerHTML}`;
      }
      horizontalClues.appendChild(li);
    }
    for (const v of vert) {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${v.num || ''}.</strong> ${v.clue} <em>(${v.answer.length} letras)</em>`;
      if (v.correcto) {
        li.classList.add("completed");
        li.innerHTML = `✅ ${li.innerHTML}`;
      }
      verticalClues.appendChild(li);
    }
  }

  // ------------------ comprobar palabra completa (en tiempo real) ------------------
  function checkWordCompletion(word) {
    // construir respuesta del usuario
    let user = "";
    for (let i = 0; i < word.answer.length; i++) {
      const r = word.dir === "H" ? word.row : word.row + i;
      const c = word.dir === "H" ? word.col + i : word.col;
      const key = `${r}-${c}`;
      const input = inputMap[key];
      user += (input && input.value) ? input.value.toUpperCase() : "";
    }

    if (user === word.answer && !word.correcto) {
      word.correcto = true;
      // bloquear y colorear letras correctas
      for (let i = 0; i < word.answer.length; i++) {
        const r = word.dir === "H" ? word.row : word.row + i;
        const c = word.dir === "H" ? word.col + i : word.col;
        const key = `${r}-${c}`;
        const input = inputMap[key];
        if (input) {
          input.value = word.answer[i];
          input.style.color = "#2d7a4b";
          input.style.fontWeight = "bold";
          input.disabled = true;
        }
      }
      // felicitar con el gatito
      const msg = `🐱 ¡Muy bien! Encontraste "${word.answer}" 🌟`;
      escribirMascota(msg);
      messageDiv.textContent = `✅ "${word.answer}" completada`;
      messageDiv.className = "message success";

      // Guardar progreso
      guardarProgreso();
      
      // Actualizar lista de pistas
      renderClues();

      // si todas completadas -> felicitación final
      if (allWords.every(w => w.correcto)) {
        escribirMascota("🎉 ¡Increíble! Completaste todo el crucigrama, EcoGatito está orgulloso 🐱💚");
        messageDiv.textContent = "🎉 ¡Crucigrama completado!";
        messageDiv.className = "message success";
        
        // Guardar estadísticas si es usuario registrado
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        if (currentUser) {
          guardarEstadisticasJuego(currentUser);
        }
        
        // Limpiar progreso al completar
        const key = currentUser ? `crucigramaProgreso_${currentUser.email}` : 'crucigramaProgreso_guest';
        localStorage.removeItem(key);
      }
    }
  }

  // ------------------ al escribir en una celda revisa palabras de esa celda ------------------
  function onCellInput(r, c) {
    const key = `${r}-${c}`;
    const wordsHere = cellsToWords[key] || [];
    for (const w of wordsHere) {
      checkWordCompletion(w);
    }
  }

  // ------------------ botón Verificar (revisa todo) ------------------
  function verifyAll() {
    let missing = 0;
    for (const w of allWords) {
      if (w.correcto) continue;
      let user = "";
      for (let i = 0; i < w.answer.length; i++) {
        const r = w.dir === "H" ? w.row : w.row + i;
        const c = w.dir === "H" ? w.col + i : w.col;
        const key = `${r}-${c}`;
        const input = inputMap[key];
        user += (input && input.value) ? input.value.toUpperCase() : "";
      }
      if (user === w.answer) {
        checkWordCompletion(w);
      } else {
        missing++;
      }
    }
    if (missing === 0 && allWords.every(w => w.correcto)) {
      escribirMascota("🎉 ¡Todo correcto! EcoGatito está feliz 🐱💚");
      messageDiv.textContent = "✅ ¡Todo correcto!";
      messageDiv.className = "message success";
    } else {
      messageDiv.textContent = `❌ Faltan o están mal ${missing} palabra(s)`;
      messageDiv.className = "message error";
    }
  }

  // ------------------ Reiniciar ------------------
  function resetAll() {
    for (const key in inputMap) {
      const input = inputMap[key];
      input.value = "";
      input.disabled = false;
      input.style.color = "#000";
      input.style.fontWeight = "normal";
    }
    allWords.forEach(w => w.correcto = false);
    messageDiv.textContent = "🔄 Crucigrama reiniciado";
    messageDiv.className = "message";
    escribirMascota("🐱 ¡Listo! Puedes empezar de nuevo. 💪");
    
    // Limpiar progreso guardado
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const guestMode = localStorage.getItem("guestMode") === "true";
    if (currentUser || guestMode) {
      const key = currentUser ? `crucigramaProgreso_${currentUser.email}` : 'crucigramaProgreso_guest';
      localStorage.removeItem(key);
    }
    
    // Actualizar lista de pistas
    renderClues();
  }

  // ------------------ inicializador del crucigrama (construye mapas y UI) ------------------
  function iniciarCrucigrama() {
    // limpiar y reconstruir
    crossword.innerHTML = "";
    Object.keys(inputMap).forEach(k => delete inputMap[k]);

    buildMaps();

    // asegurar cellsToWords está completo (ya rellenado en buildMaps)
    buildGridVisual();
    renderClues();

    messageDiv.textContent = "✅ Crucigrama listo. ¡Buena suerte!";
    messageDiv.className = "message success";
    escribirMascota("🐱 ¡Vamos! Completa las palabras según las pistas ✨");
    
    // Cargar progreso guardado después de construir la UI
    setTimeout(() => {
      cargarProgreso();
    }, 500);
  }

  // ------------------ Intro (máquina de escribir con pasos) ------------------
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
    "Hoy jugaremos al crucigrama de Energías Limpias.",
    "Lee las pistas y escribe las palabras en las casillas.",
    "Si completas una palabra correctamente, se bloqueará automáticamente.",
    "¡Puedes guardar tu progreso y continuar después!"
  ];
  let currentStep = 0;

  function startIntro() {
    if (!textoMascotaNodes.length) {
      // si no hay bocadillo, iniciar crucigrama directamente
      iniciarCrucigrama();
      return;
    }
    typeToNodes(introMessages[currentStep], 35, () => { currentStep++; });
    if (btnSiguiente) {
      btnSiguiente.addEventListener("click", () => {
        if (currentStep < introMessages.length) {
          typeToNodes(introMessages[currentStep], 35, () => {
            currentStep++;
            if (currentStep === introMessages.length) btnSiguiente.textContent = "🎮 ¡Jugar!";
          });
        } else {
          // finalizar intro: ocultar intro y mostrar juego
          if (mascotaIntro) mascotaIntro.style.display = "none";
          if (juego) juego.style.display = "block";
          iniciarCrucigrama();
        }
      });
    } else {
      // si no hay botón, pasar automáticamente
      setTimeout(() => {
        iniciarCrucigrama();
      }, 700);
    }
  }

  // iniciar comportamiento
  startIntro();

  // listeners botones
  if (checkButton) checkButton.addEventListener("click", verifyAll);
  if (resetButton) resetButton.addEventListener("click", resetAll);

  // si el usuario recarga y la intro fue saltada, inicializamos el juego automáticamente
  setTimeout(() => {
    if (!document.querySelector("#crossword .cell input") && (!mascotaIntro || mascotaIntro.style.display === "none")) {
      iniciarCrucigrama();
    }
  }, 200);
});