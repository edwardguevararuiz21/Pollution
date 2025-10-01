document.addEventListener("DOMContentLoaded", () => {
  const palabras = [
    "SOLAR", "VIENTO", "AGUA", "BIOMASA", "RENOVABLE", "EOLICA", 
    "GEOTERMICA", "HIDRAULICA", "ENERGIA", "LIMPA", "VERDE", 
    "SOSTENIBLE", "ECOLOGICO", "PANEL", "TURBINA", "RECICLAJE"
  ];
  
  const total = palabras.length;
  const sopa = document.getElementById("sopa");
  const lista = document.getElementById("listaPalabras");
  const encontradasSpan = document.getElementById("encontradas");
  const totalSpan = document.getElementById("total");
  const textoMascota = document.getElementById("textoMascota");
  const btnSiguiente = document.getElementById("btnSiguiente");
  const juego = document.getElementById("juego");
  const tiempoSpan = document.getElementById("tiempo");

  let encontradas = 0;
  let tiempo = 480;
  let timer;
  let gridSize = 15;
  let matriz = [];
  let seleccion = [];
  let isMouseDown = false;
  
  totalSpan.textContent = total;

  // Cargar progreso guardado
  function cargarProgreso() {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const guestMode = localStorage.getItem("guestMode") === "true";
    
    if (!currentUser && !guestMode) return;

    const key = currentUser ? `sopaProgreso_${currentUser.email}` : 'sopaProgreso_guest';
    const progreso = localStorage.getItem(key);
    
    if (progreso) {
      const data = JSON.parse(progreso);
      encontradas = data.encontradas || 0;
      tiempo = data.tiempo || 480;
      encontradasSpan.textContent = encontradas;
      
      // Marcar palabras ya encontradas
      data.palabrasEncontradas?.forEach(palabra => {
        const li = document.getElementById("word-" + palabra);
        if (li && !li.classList.contains("found")) {
          li.classList.add("found", "word-" + palabra);
        }
      });
    }
  }

  // Guardar progreso
  function guardarProgreso() {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const guestMode = localStorage.getItem("guestMode") === "true";
    
    if (!currentUser && !guestMode) return;

    const palabrasEncontradas = [];
    palabras.forEach(palabra => {
      const li = document.getElementById("word-" + palabra);
      if (li && li.classList.contains("found")) {
        palabrasEncontradas.push(palabra);
      }
    });
    
    const progreso = {
      encontradas: encontradas,
      tiempo: tiempo,
      palabrasEncontradas: palabrasEncontradas,
      fecha: new Date().toISOString()
    };
    
    const key = currentUser ? `sopaProgreso_${currentUser.email}` : 'sopaProgreso_guest';
    localStorage.setItem(key, JSON.stringify(progreso));
  }

  // Máquina de escribir
  function escribirTexto(texto, callback) {
    let i = 0;
    textoMascota.textContent = "";
    const intervalo = setInterval(() => {
      textoMascota.textContent += texto.charAt(i);
      i++;
      if (i >= texto.length) {
        clearInterval(intervalo);
        if (callback) callback();
      }
    }, 40);
  }

  // Mensajes personalizados según el usuario
  const mensajes = [
    (function() {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      const guestMode = localStorage.getItem("guestMode") === "true";
      if (currentUser) {
        return `💬 ¡Hola ${currentUser.nombre}! Soy EcoGatito 🐱 y hoy te traigo un reto divertido.`;
      } else if (guestMode) {
        return "💬 ¡Hola amigo! Soy EcoGatito 🐱 y hoy te traigo un reto divertido.";
      } else {
        return "💬 ¡Hola! Soy EcoGatito 🐱 y hoy te traigo un reto divertido.";
      }
    })(),
    "📖 Vamos a jugar a la Sopa de Letras sobre energsías limpias.",
    "🔍 Encuentra todas las palabras ocultas. Tienes 8 minutos ⏰.",
    "¡Pueden estar en horizontal, vertical o diagonal!",
    "¡Cuando termines iremos al crucigrama para continuar!"
  ];
  
  let paso = 0;
  escribirTexto(mensajes[0]);

  btnSiguiente.addEventListener("click", () => {
    if (paso < mensajes.length - 1) {
      paso++;
      escribirTexto(mensajes[paso], () => {
        if (paso === mensajes.length - 1) {
          btnSiguiente.textContent = "¡Comenzar!";
        }
      });
    } else {
      btnSiguiente.style.display = "none";
      iniciarJuego();
    }
  });

  function iniciarJuego() {
    juego.style.display = "block";
    generarSopa();
    mostrarLista();
    cargarProgreso();
    startTimer();
  }

  // Timer con avisos
  function startTimer() {
    timer = setInterval(() => {
      let min = Math.floor(tiempo / 60);
      let seg = tiempo % 60;
      tiempoSpan.textContent = `${min}:${seg < 10 ? "0" : ""}${seg}`;

      if (tiempo === 120) hablar("⏳ ¡Quedan 2 minutos, apresúrate!");
      if (tiempo === 60) hablar("⚡ ¡Último minuto!");
      if (tiempo === 30) hablar("⏰ ¡Solo 30 segundos!");

      if (tiempo <= 0) {
        clearInterval(timer);
        hablar("😿 El tiempo terminó... ¡inténtalo otra vez!");
        guardarProgreso();
      }
      
      // Guardar progreso cada 10 segundos
      if (tiempo % 10 === 0) {
        guardarProgreso();
      }
      
      tiempo--;
    }, 1000);
  }

  // Generar sopa mejorada con diagonales
  function generarSopa() {
    const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    matriz = Array.from({ length: gridSize }, () => Array(gridSize).fill(""));

    // Colocar palabras
    palabras.forEach(palabra => {
      let colocada = false;
      let intentos = 0;
      
      while (!colocada && intentos < 100) {
        const direccion = Math.floor(Math.random() * 4); // 0: horizontal, 1: vertical, 2: diagonal derecha, 3: diagonal izquierda
        let fila, columna;
        
        switch (direccion) {
          case 0: // Horizontal
            fila = Math.floor(Math.random() * gridSize);
            columna = Math.floor(Math.random() * (gridSize - palabra.length));
            if (puedeColocar(palabra, fila, columna, 0, 1)) {
              colocarPalabra(palabra, fila, columna, 0, 1);
              colocada = true;
            }
            break;
            
          case 1: // Vertical
            fila = Math.floor(Math.random() * (gridSize - palabra.length));
            columna = Math.floor(Math.random() * gridSize);
            if (puedeColocar(palabra, fila, columna, 1, 0)) {
              colocarPalabra(palabra, fila, columna, 1, 0);
              colocada = true;
            }
            break;
            
          case 2: // Diagonal derecha (abajo-derecha)
            fila = Math.floor(Math.random() * (gridSize - palabra.length));
            columna = Math.floor(Math.random() * (gridSize - palabra.length));
            if (puedeColocar(palabra, fila, columna, 1, 1)) {
              colocarPalabra(palabra, fila, columna, 1, 1);
              colocada = true;
            }
            break;
            
          case 3: // Diagonal izquierda (abajo-izquierda)
            fila = Math.floor(Math.random() * (gridSize - palabra.length));
            columna = Math.floor(Math.random() * (gridSize - palabra.length)) + palabra.length - 1;
            if (columna < gridSize && puedeColocar(palabra, fila, columna, 1, -1)) {
              colocarPalabra(palabra, fila, columna, 1, -1);
              colocada = true;
            }
            break;
        }
        intentos++;
      }
    });

    // Rellenar espacios vacíos
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if (matriz[i][j] === "") {
          matriz[i][j] = letras.charAt(Math.floor(Math.random() * letras.length));
        }
        const cell = document.createElement("div");
        cell.textContent = matriz[i][j];
        cell.dataset.row = i;
        cell.dataset.col = j;
        sopa.appendChild(cell);
      }
    }

    activarSeleccion();
  }

  function puedeColocar(palabra, fila, columna, dirFila, dirCol) {
    for (let i = 0; i < palabra.length; i++) {
      const f = fila + i * dirFila;
      const c = columna + i * dirCol;
      
      if (f >= gridSize || c >= gridSize || f < 0 || c < 0) return false;
      if (matriz[f][c] !== "" && matriz[f][c] !== palabra[i]) return false;
    }
    return true;
  }

  function colocarPalabra(palabra, fila, columna, dirFila, dirCol) {
    for (let i = 0; i < palabra.length; i++) {
      const f = fila + i * dirFila;
      const c = columna + i * dirCol;
      matriz[f][c] = palabra[i];
    }
  }

  function mostrarLista() {
    palabras.forEach(p => {
      const li = document.createElement("li");
      li.textContent = p;
      li.id = "word-" + p;
      lista.appendChild(li);
    });
  }

  // Sistema de selección mejorado
  function activarSeleccion() {
    sopa.addEventListener("mousedown", iniciarSeleccion);
    sopa.addEventListener("touchstart", iniciarSeleccionTouch);
    
    sopa.addEventListener("mouseover", extenderSeleccion);
    
    window.addEventListener("mouseup", finalizarSeleccion);
    window.addEventListener("touchend", finalizarSeleccion);
    
    // Prevenir arrastre de imágenes
    sopa.addEventListener("dragstart", (e) => e.preventDefault());
  }

  function iniciarSeleccion(e) {
    if (e.target.tagName === "DIV" && e.target.parentNode === sopa) {
      e.preventDefault();
      isMouseDown = true;
      seleccion = [e.target];
      e.target.classList.add("seleccionado");
    }
  }

  function iniciarSeleccionTouch(e) {
    if (e.target.tagName === "DIV" && e.target.parentNode === sopa) {
      e.preventDefault();
      isMouseDown = true;
      seleccion = [e.target];
      e.target.classList.add("seleccionado");
    }
  }

  function extenderSeleccion(e) {
    if (isMouseDown && e.target.tagName === "DIV" && e.target.parentNode === sopa) {
      e.preventDefault();
      if (!seleccion.includes(e.target)) {
        seleccion.push(e.target);
        e.target.classList.add("seleccionado");
      }
    }
  }

  function finalizarSeleccion() {
    if (isMouseDown && seleccion.length > 0) {
      checkSeleccion(seleccion);
      document.querySelectorAll(".seleccionado").forEach(c => c.classList.remove("seleccionado"));
      seleccion = [];
      isMouseDown = false;
    }
  }

  // Verificar selección mejorada
  function checkSeleccion(cells) {
    if (cells.length < 2) return;
    
    const palabraSeleccionada = cells.map(c => c.textContent).join("");
    const palabraInvertida = cells.map(c => c.textContent).reverse().join("");
    
    let palabraEncontrada = null;
    if (palabras.includes(palabraSeleccionada)) {
      palabraEncontrada = palabraSeleccionada;
    } else if (palabras.includes(palabraInvertida)) {
      palabraEncontrada = palabraInvertida;
    }

    if (palabraEncontrada) {
      const li = document.getElementById("word-" + palabraEncontrada);
      if (li && !li.classList.contains("found")) {
        li.classList.add("found", "word-" + palabraEncontrada);
        cells.forEach(c => c.classList.add("word-" + palabraEncontrada, "found"));
        encontradas++;
        encontradasSpan.textContent = encontradas;
        
        hablar(`🎉 ¡Muy bien! Encontraste "${palabraEncontrada}"`);
        guardarProgreso();

        if (encontradas === total) {
          clearInterval(timer);
          document.getElementById("finJuego").style.display = "block";
          document.getElementById("felicitacionFinal").textContent = "🌟 ¡Completaste la Sopa de Letras!";
          hablar("✨ Excelente trabajo, ahora pasemos al crucigrama 👉");
          
          // Guardar estadísticas si es usuario registrado
          const currentUser = JSON.parse(localStorage.getItem("currentUser"));
          if (currentUser) {
            guardarEstadisticasJuego(currentUser, "sopa");
          }
          
          // Limpiar progreso al completar
          const key = currentUser ? `sopaProgreso_${currentUser.email}` : 'sopaProgreso_guest';
          localStorage.removeItem(key);
        }
      }
    }
  }

  function guardarEstadisticasJuego(user, tipoJuego) {
    const statsKey = `userStats_${user.email}`;
    const stats = JSON.parse(localStorage.getItem(statsKey)) || {
      juegosCompletados: 0,
      puntosTotales: 0,
      tiempoJugado: 0,
      evaluaciones: []
    };
    
    stats.juegosCompletados += 1;
    stats.puntosTotales += 100; // 100 puntos por juego completado
    stats.tiempoJugado += 8; // 8 minutos estimados
    
    localStorage.setItem(statsKey, JSON.stringify(stats));
  }

  function hablar(texto) {
    escribirTexto(texto);
  }
});