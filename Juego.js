/******************************** 
 Pollution — Juego educativo
 Versión CON SISTEMA DE USUARIOS UNIFICADO
********************************/

/* ---------- Tablero (5x7) ---------- */
const ROWS = 5, COLS = 7;
const TOTAL = ROWS * COLS;

/* ---------- Estado inicial ---------- */
let state = {
  dinero: 200,
  contaminacion: 15,
  felicidad: 100,
  nivel: 1,
  cells: [],
  enemies: [],
  achievements: new Set(),
  ticks: 0,
  mission: null,
  gameId: null,
  gameStarted: false,
  missionCompleted: false,
  playerName: 'Jugador'
};

let mainTickInterval = null;
let spawnTimer = null;
let finalBossDefeated = false;

/* ---------- Sistema de Mensajes Mejorado ---------- */
let mensajesPendientes = [];
let mensajeActual = null;
let mostrandoMensaje = false;

/* ---------- PLANTS CON IMÁGENES ---------- */
const PLANTS = {
  solar:     {img:'img/solar.png', cost:20, clean:5, contChange:-2, maintenance:1, kind:'clean', name:'Solar'},
  eolica:    {img:'img/eolica.png', cost:30, clean:7, contChange:-3, maintenance:1, kind:'clean', name:'Eólica'},
  hidro:     {img:'img/hidro.png', cost:40, clean:10, contChange:-5, maintenance:2, kind:'clean', name:'Hidroeléctrica'},
  carbon:    {img:'img/carbon.png', cost:10, clean:0, contChange:+12, maintenance:1, kind:'dirty', name:'Carbón', happiness:-8},
  petroleo:  {img:'img/petroleo.png', cost:15, clean:0, contChange:+8, maintenance:1, kind:'dirty', name:'Petróleo', happiness:-5},
  geotermica:{img:'img/geotermica.png', cost:35, clean:9, contChange:-4, maintenance:2, kind:'clean', name:'Geotérmica'},
  biomasa:   {img:'img/biomasa.png', cost:25, clean:6, contChange:-2, maintenance:1, kind:'clean', name:'Biomasa'}
};

/* ---------- ENEMIES POOL ---------- */
const ENEMIES_POOL = [
  {id:'politico', emojiSrc:'img/politico.png', power:0.8, moneyDamage:25, contAdd:8, speed:1.0, reward:15},
  {id:'dragon',   emojiSrc:'img/dragon.png',   power:1.6, moneyDamage:0, contAdd:25, speed:1.1, reward:25},
  {id:'alien',    emojiSrc:'img/alien.png',    power:1.2, moneyDamage:20, contAdd:15, speed:1.3, reward:20},
  {id:'industria', emojiSrc:'img/industria.png', power:1.4, moneyDamage:30, contAdd:20, speed:0.9, reward:30},
  {id:'contaminador', emojiSrc:'img/contaminacion.png', power:1.8, moneyDamage:35, contAdd:30, speed:0.8, reward:40},
  {id:'jefe_final', emojiSrc:'img/jefe_final.png', power:3.0, moneyDamage:50, contAdd:40, speed:0.5, reward:100}
];

/* ---------- LEVELS MEJORADOS ---------- */
const LEVELS = [
  {
    name: "Nivel 1: Primeros Pasos",
    objectives:[
      {chk:s=>countPlants(s,'solar')+countPlants(s,'eolica')+countPlants(s,'hidro')+countPlants(s,'geotermica')+countPlants(s,'biomasa') >= 3, text:"Construir 3 plantas limpias"},
      {chk:s=>s.contaminacion < 35, text:"Contaminación < 35%"},
      {chk:s=>s.dinero >= 80, text:"Tener al menos 80 monedas"},
      {chk:s=>totalPlants(s) >= 4, text:"Tener 4 plantas en total"}
    ], 
    enemyRate: 3000,
    enemyPowerMultiplier: 1.2,
    mission: {text: "Construye 3 plantas limpias y mantén la ciudad ordenada", reward: {dinero:60, felicidad:15}}
  },
  {
    name: "Nivel 2: Expansión Verde",
    objectives:[
      {chk:s=>totalPlants(s) >= 6, text:"Tener al menos 6 plantas"},
      {chk:s=>s.dinero > 150, text:"Dinero > 150"},
      {chk:s=>countPlants(s,'carbon')+countPlants(s,'petroleo') <= 1, text:"Máximo 1 planta contaminante"},
      {chk:s=>s.felicidad > 65, text:"Felicidad > 65%"}
    ], 
    enemyRate: 2500,
    enemyPowerMultiplier: 1.4,
    mission:{text:"Expande tu ciudad con energía limpia y ciudadanos felices", reward:{dinero:100, felicidad:10}}
  },
  {
    name: "Nivel 3: Ciudad Sostenible",
    objectives:[
      {chk:s=>totalPlants(s) >= 8, text:"Tener al menos 8 plantas"},
      {chk:s=>s.contaminacion < 25, text:"Contaminación < 25%"},
      {chk:s=>s.felicidad > 75, text:"Felicidad > 75%"},
      {chk:s=>countPlants(s,'hidro')+countPlants(s,'geotermica') >= 2, text:"Al menos 2 plantas avanzadas"},
      {chk:s=>countPlants(s,'carbon')+countPlants(s,'petroleo') === 0, text:"Cero plantas contaminantes"}
    ], 
    enemyRate: 2000,
    enemyPowerMultiplier: 1.7,
    mission:{text:"Convierte tu ciudad en 100% sostenible sin contaminantes", reward:{dinero:150, felicidad:20}}
  }
];

let miniBossDefeated = false;

function defeatMiniBoss(s) {
  return miniBossDefeated;
}

function defeatFinalBoss(s) {
  return finalBossDefeated;
}

/* ---------- SISTEMA DE MASCOTA COMPLETO ---------- */
function agregarMensaje(texto, tipo = 'mascota') {
    mensajesPendientes.push({ texto, tipo });
    if (!mostrandoMensaje) {
        mostrarSiguienteMensaje();
    }
}

function mostrarSiguienteMensaje() {
    if (mensajesPendientes.length === 0) {
        mostrandoMensaje = false;
        return;
    }
    
    mostrandoMensaje = true;
    mensajeActual = mensajesPendientes.shift();
    
    if (mensajeActual.tipo === 'mascota') {
        mostrarMensajeMascota(mensajeActual.texto);
    } else {
        mostrarMensajeEco(mensajeActual.texto);
    }
}

function mostrarMensajeMascota(texto) {
    const mascotaTextoEl = document.getElementById('mascotaTexto');
    const mascotaMsgEl = document.getElementById('mascotaMensaje');
    const mascotaImgEl = document.getElementById('mascota');
    
    if (mascotaTextoEl) mascotaTextoEl.textContent = texto;
    if (mascotaMsgEl) {
        mascotaMsgEl.style.display = 'block';
        mascotaMsgEl.classList.add('mensaje-nuevo');
    }
    
    if (mascotaImgEl) {
        mascotaImgEl.classList.add('mascota-talk');
        setTimeout(() => mascotaImgEl.classList.remove('mascota-talk'), 1000);
    }
}

function mostrarMensajeEco(texto) {
    const ecoMessageEl = document.getElementById('ecoMessage');
    const ecoSpeechEl = document.getElementById('ecoSpeech');
    
    if (ecoMessageEl) ecoMessageEl.textContent = texto;
    if (ecoSpeechEl) {
        ecoSpeechEl.style.display = 'block';
        ecoSpeechEl.classList.add('mensaje-nuevo');
    }
}

function ocultarMensajeMascota() {
    const mascotaMsgEl = document.getElementById('mascotaMensaje');
    const mascotaImgEl = document.getElementById('mascota');
    
    if (mascotaMsgEl) {
        mascotaMsgEl.style.display = 'none';
        mascotaMsgEl.classList.remove('mensaje-nuevo');
    }
    
    if (mascotaImgEl) {
        mascotaImgEl.classList.remove('mascota-talk');
    }
    
    setTimeout(mostrarSiguienteMensaje, 300);
}

function ocultarMensajeEco() {
    const ecoSpeechEl = document.getElementById('ecoSpeech');
    if (ecoSpeechEl) {
        ecoSpeechEl.style.display = 'none';
        ecoSpeechEl.classList.remove('mensaje-nuevo');
    }
    setTimeout(mostrarSiguienteMensaje, 300);
}

function mascotaHabla(texto) {
    agregarMensaje(texto, 'mascota');
}

function ecoHabla(texto) {
    agregarMensaje(texto, 'eco');
}

// 🌟 SISTEMA DE SALUDOS PERSONALIZADOS MEJORADO
function obtenerNombreJugador() {
    if (window.userSystem && window.userSystem.currentUser) {
        console.log('👤 Usuario encontrado:', window.userSystem.currentUser.nombre);
        return window.userSystem.currentUser.nombre;
    }
    console.log('👤 No hay usuario, usando "Jugador" por defecto');
    return 'Jugador';
}

function actualizarNombreJugador() {
    state.playerName = obtenerNombreJugador();
    console.log('🎯 Nombre del jugador actualizado:', state.playerName);
}

function mascotaSaluda() {
    const nombre = obtenerNombreJugador();
    const saludos = [
        `¡Hola ${nombre}! 🐱 Soy EcoGatito, tu guía en esta aventura ecológica.`,
        `¡Bienvenido ${nombre}! 🌍 Juntos construiremos una ciudad sostenible.`,
        `¡Hola ${nombre}! 💚 Me da mucho gusto acompañarte en este viaje ecológico.`,
        `¡${nombre}! 🎉 Qué emoción tenerte aquí. Prepárate para salvar el planeta.`,
        `¡Guau! ${nombre} está aquí 🐾 ¿Listo para una aventura verde?`
    ];
    
    const saludo = saludos[Math.floor(Math.random() * saludos.length)];
    mascotaHabla(saludo);
}

function mascotaFelicita(logro) {
    const nombre = obtenerNombreJugador();
    const felicitaciones = {
        nivel: [
            `¡Increíble ${nombre}! 🏆 Has completado el nivel con maestría.`,
            `¡Bravo ${nombre}! 🌟 Tu destreza ecológica es admirable.`,
            `¡${nombre}, eres un genio! 💡 Has dominado este nivel perfectamente.`,
            `¡Fenomenal ${nombre}! 🎯 Tu estrategia ecológica es perfecta.`
        ],
        planta: [
            `¡Bien hecho ${nombre}! 🌱 Esa planta ayudará mucho al medio ambiente.`,
            `¡Excelente elección ${nombre}! 💚 Esa planta hará nuestra ciudad más limpia.`,
            `¡Perfecto ${nombre}! 🌿 Cada planta cuenta para un futuro mejor.`,
            `¡Gran trabajo ${nombre}! 🍃 Esa planta es un paso hacia la sostenibilidad.`
        ],
        enemigo: [
            `¡Bien eliminado ${nombre}! 🎯 Ese enemigo no contaminará más.`,
            `¡Excelente defensa ${nombre}! 🛡️ Proteges bien nuestro ecosistema.`,
            `¡Perfecto ${nombre}! 💥 Así mantenemos nuestra ciudad limpia.`,
            `¡Gran trabajo ${nombre}! 👏 Cada enemigo eliminado ayuda al planeta.`
        ]
    };
    
    const mensajes = felicitaciones[logro] || felicitaciones.nivel;
    return mensajes[Math.floor(Math.random() * mensajes.length)];
}

function mascotaAconseja() {
    const nombre = obtenerNombreJugador();
    const consejos = [
        `Recuerda ${nombre}, las plantas verdes reducen la contaminación. 🌿`,
        `${nombre}, no olvides que los enemigos dan recompensas al eliminarlos. 🎯`,
        `Oye ${nombre}, mantener alta la felicidad es clave para el éxito. 😊`,
        `${nombre}, las plantas rojas son baratas pero muy contaminantes. ⚠️`,
        `Amigo ${nombre}, planifica bien donde pones cada planta. 🗺️`,
        `${nombre}, elimina rápido a los enemigos antes que ataquen. ⚡`
    ];
    
    return consejos[Math.floor(Math.random() * consejos.length)];
}

/* ---------- INSTRUCCIONES INICIALES ---------- */
function mostrarInstruccionesIniciales() {
    mensajesPendientes = [];
    
    const nombre = obtenerNombreJugador();
    
    setTimeout(() => {
        mascotaHabla(`¡Hola ${nombre}! 🐱 Soy EcoGatito, tu guía en esta aventura ecológica.`);
    }, 500);
    
    setTimeout(() => {
        mascotaHabla(`Vamos a construir juntos una ciudad sostenible y feliz, ${nombre}.`);
    }, 3000);
    
    setTimeout(() => {
        mascotaHabla(`📖 INSTRUCCIONES BÁSICAS para ti ${nombre}:`);
    }, 6000);
    
    setTimeout(() => {
        mascotaHabla(`1. ARRASTRA plantas del panel superior al tablero, ${nombre}`);
    }, 9000);
    
    setTimeout(() => {
        mascotaHabla(`2. Las plantas LIMPIAS (verdes) reducen contaminación, ${nombre}`);
    }, 12000);
    
    setTimeout(() => {
        mascotaHabla(`3. Las plantas CONTAMINANTES (rojas) son baratas pero dañinas, ${nombre}`);
    }, 15000);
    
    setTimeout(() => {
        mascotaHabla(`4. HAZ CLIC en los enemigos para eliminarlos y ganar dinero, ${nombre}`);
    }, 18000);
    
    setTimeout(() => {
        mascotaHabla(`5. Mantén la FELICIDAD alta y la CONTAMINACIÓN baja, ${nombre}`);
    }, 21000);
    
    setTimeout(() => {
        mascotaHabla(`¡Ahora pulsa el botón '🚀 INICIAR JUEGO' para comenzar, ${nombre}!`);
    }, 24000);
}

/* ---------- Helpers ---------- */
function clamp(x, a, b) { 
  return Math.max(a, Math.min(b, x)); 
}

function addLog(txt){
  const logEl = document.getElementById('log');
  if(!logEl) return;
  const p = document.createElement('div'); 
  p.textContent = `[t=${state.ticks}] ${txt}`;
  logEl.prepend(p);
  
  while (logEl.children.length > 50) {
    logEl.removeChild(logEl.lastChild);
  }
}

function countPlants(s, type){ 
  return s.cells.reduce((a, c) => a + (c.plant && c.plant.type === type ? 1 : 0), 0); 
}

function totalPlants(s){ 
  return s.cells.reduce((a, c) => a + (c.plant ? 1 : 0), 0); 
}

/* ---------- BARRA DE PROGRESO POR NIVEL ---------- */
function updateProgressBars() {
  const progressLevelEl = document.getElementById('progressLevel');
  const progressLabel = document.getElementById('progressLabel');
  
  if (progressLevelEl && progressLabel) {
    const progress = computeLevelProgress();
    progressLevelEl.value = progress;
    progressLabel.textContent = `Progreso: ${progress}%`;
  }
}

function computeLevelProgress(){
  const levelIdx = Math.min(state.nivel - 1, LEVELS.length - 1);
  const objectives = LEVELS[levelIdx].objectives || [];
  if(objectives.length === 0) return 0;
  
  const done = objectives.reduce((acc, o) => acc + (o.chk(state) ? 1 : 0), 0);
  return Math.round((done / objectives.length) * 100);
}

/* ---------- Inicialización del Juego ---------- */
function initializeGame() {
  console.log('🎮 Inicializando juego Pollution...');
  
  // Inicializar estado del juego
  state.dinero = 200;
  state.contaminacion = 15;
  state.felicidad = 100;
  state.nivel = 1;
  state.cells = Array(TOTAL).fill().map(() => ({plant:null}));
  state.enemies = [];
  state.achievements = new Set();
  state.ticks = 0;
  state.mission = null;
  state.gameId = 'game_' + Date.now();
  state.gameStarted = false;
  state.missionCompleted = false;
  finalBossDefeated = false;
  miniBossDefeated = false;
  
  // Actualizar nombre del jugador
  actualizarNombreJugador();
  
  // Inicializar tablero
  initBoard();
  renderAllStats();
  setupEventListeners();
  assignMissionForLevel(0);
  
  // Configurar botones de mascota
  const mascotaSiguienteBtn = document.getElementById('mascotaSiguienteBtn');
  const nextMessageBtn = document.getElementById('nextMessageBtn');
  
  if (mascotaSiguienteBtn) {
      mascotaSiguienteBtn.addEventListener('click', ocultarMensajeMascota);
  }
  
  if (nextMessageBtn) {
      nextMessageBtn.addEventListener('click', ocultarMensajeEco);
  }
  
  // Inicializar sistema de usuarios
  setupUserSystem();
  
  // Saludo personalizado de la mascota
  setTimeout(() => {
      mascotaSaluda();
  }, 1000);
  
  // Mostrar instrucciones iniciales después del saludo
  setTimeout(() => {
      mostrarInstruccionesIniciales();
  }, 4000);
  
  console.log('✅ Juego inicializado correctamente');
}

/* ---------- SISTEMA DE USUARIOS EN EL JUEGO ---------- */
function setupUserSystem() {
    console.log('🔧 Configurando sistema de usuarios en el juego...');
    
    const saveGameBtn = document.getElementById('saveGameBtn');
    const loadGameBtn = document.getElementById('loadGameBtn');
    const logoutBtn = document.querySelector('.logout-btn');

    if (saveGameBtn) {
        saveGameBtn.addEventListener('click', saveCurrentGame);
        console.log('✅ Botón guardar configurado');
    }

    if (loadGameBtn) {
        loadGameBtn.addEventListener('click', showSavedGames);
        console.log('✅ Botón cargar configurado');
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (window.userSystem) {
                window.userSystem.logout();
            }
        });
        console.log('✅ Botón logout configurado');
    }

    // Actualizar nombre del jugador
    actualizarNombreJugador();
    
    // Mostrar saludo si hay usuario
    if (window.userSystem && window.userSystem.currentUser) {
        setTimeout(() => {
            if (window.userSystem.mostrarSaludoPersonalizado) {
                window.userSystem.mostrarSaludoPersonalizado();
            }
        }, 1500);
    }

    // Cargar lista de partidas guardadas
    updateSavedGamesList();
}

function saveCurrentGame() {
    console.log('💾 Intentando guardar partida...');
    
    if (!window.userSystem) {
        console.error('❌ Sistema de usuarios no disponible');
        mascotaHabla('⚠️ Error: Sistema de usuarios no disponible');
        return;
    }

    if (!window.userSystem.currentUser) {
        console.error('❌ No hay usuario logueado');
        mascotaHabla('⚠️ Debes iniciar sesión para guardar partidas');
        return;
    }

    // Crear una copia segura del estado
    const gameData = {
        dinero: state.dinero,
        contaminacion: state.contaminacion,
        felicidad: state.felicidad,
        nivel: state.nivel,
        cells: state.cells.map(cell => ({
            plant: cell.plant ? {
                type: cell.plant.type,
                hp: cell.plant.hp,
                _destroying: cell.plant._destroying || false
            } : null
        })),
        enemies: state.enemies.map(enemy => ({...enemy})),
        achievements: Array.from(state.achievements),
        ticks: state.ticks,
        gameStarted: state.gameStarted,
        missionCompleted: state.missionCompleted,
        playerName: state.playerName,
        timestamp: new Date().toISOString()
    };

    console.log('📦 Datos de la partida a guardar:', gameData);

    const success = window.userSystem.saveGame(gameData);
    
    if (success) {
        console.log('✅ Partida guardada correctamente');
        mascotaHabla('✅ Partida guardada correctamente');
        updateSavedGamesList();
        
        // Actualizar estadísticas
        const stats = {
            maxLevel: Math.max(window.userSystem.getStats().maxLevel || 0, state.nivel),
            gamesPlayed: (window.userSystem.getStats().gamesPlayed || 0) + 1,
            plantsBuilt: (window.userSystem.getStats().plantsBuilt || 0) + totalPlants(state),
            maxMoney: Math.max(window.userSystem.getStats().maxMoney || 0, state.dinero),
            lastPlayed: new Date().toISOString()
        };
        window.userSystem.saveStats(stats);
    } else {
        console.error('❌ Error al guardar la partida');
        mascotaHabla('❌ Error al guardar la partida');
    }
}

function updateSavedGamesList() {
    const savedGamesList = document.getElementById('savedGamesList');
    if (!savedGamesList) {
        console.error('❌ No se encontró el elemento de lista de partidas guardadas');
        return;
    }

    if (!window.userSystem) {
        console.error('❌ Sistema de usuarios no disponible');
        return;
    }

    const games = window.userSystem.loadGames();
    console.log('📂 Partidas guardadas encontradas:', games.length);
    
    if (games.length === 0) {
        savedGamesList.innerHTML = '<p style="text-align:center;color:#666;">No hay partidas guardadas</p>';
        return;
    }

    savedGamesList.innerHTML = games.map(game => `
        <div class="saved-game-item">
            <div class="saved-game-info">
                <strong>Partida ${new Date(game.timestamp).toLocaleDateString()}</strong>
                <small>Nivel ${game.data.nivel} • 💰 ${Math.round(game.data.dinero)} • ☠️ ${Math.round(game.data.contaminacion)}%</small>
            </div>
            <div class="saved-game-actions">
                <button onclick="loadGame('${game.id}')" class="load-game-btn">Cargar</button>
                <button onclick="deleteGame('${game.id}')" class="delete-game-btn">🗑️</button>
            </div>
        </div>
    `).join('');
}

function loadGame(gameId) {
    console.log('📥 Cargando partida:', gameId);
    
    if (!window.userSystem) {
        console.error('❌ Sistema de usuarios no disponible');
        return;
    }

    const games = window.userSystem.loadGames();
    const gameToLoad = games.find(game => game.id === gameId);
    
    if (gameToLoad) {
        console.log('✅ Partida encontrada, cargando...');
        
        // Detener el juego actual
        if (mainTickInterval) {
            clearInterval(mainTickInterval);
            mainTickInterval = null;
        }
        if (spawnTimer) {
            clearInterval(spawnTimer);
            spawnTimer = null;
        }
        
        // Cargar el estado guardado
        state = { 
            ...gameToLoad.data,
            gameStarted: false // Pausar el juego después de cargar
        };
        
        // Actualizar nombre del jugador
        if (gameToLoad.data.playerName) {
            state.playerName = gameToLoad.data.playerName;
        } else {
            actualizarNombreJugador();
        }
        
        renderAllStats();
        initBoard();
        renderEnemies();
        
        mascotaHabla('✅ Partida cargada correctamente');
        addLog(`Partida cargada - Nivel ${state.nivel}`);
        
        console.log('✅ Partida cargada exitosamente');
    } else {
        console.error('❌ Partida no encontrada:', gameId);
        mascotaHabla('❌ Error: No se pudo cargar la partida');
    }
}

function deleteGame(gameId) {
    if (confirm('¿Estás seguro de que quieres eliminar esta partida?')) {
        if (window.userSystem) {
            window.userSystem.deleteGame(gameId);
            updateSavedGamesList();
            mascotaHabla('🗑️ Partida eliminada');
        }
    }
}

function showSavedGames() {
    console.log('📋 Mostrando partidas guardadas...');
    updateSavedGamesList();
}

/* ---------- TABLERO CON IMÁGENES DE PLANTAS ---------- */
function initBoard(){
  const tableroEl = document.getElementById('tablero');
  if (!tableroEl) {
    console.error('❌ No se encontró el elemento tablero');
    return;
  }
  
  console.log('🔄 Inicializando tablero...');
  tableroEl.innerHTML = '';
  state.cells = [];
  
  for(let i = 0; i < TOTAL; i++){
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.dataset.index = i;
    
    cell.addEventListener('dragover', e => e.preventDefault());
    cell.addEventListener('drop', onDropCell);
    cell.addEventListener('click', onCellClick);
    
    const meta = document.createElement('div'); 
    meta.className = 'meta';
    cell.appendChild(meta);
    
    tableroEl.appendChild(cell);
    state.cells.push({plant:null});
  }
  
  console.log('✅ Tablero inicializado con', TOTAL, 'celdas');
}

function renderCell(i){
  const tableroEl = document.getElementById('tablero');
  if (!tableroEl) return;
  
  const el = tableroEl.children[i];
  if (!el) return;
  
  el.innerHTML = '';
  const meta = document.createElement('div'); 
  meta.className = 'meta';
  
  if(state.cells[i].plant){
    const p = state.cells[i].plant;
    const data = PLANTS[p.type];
    
    const plantImg = document.createElement('img');
    plantImg.className = 'plant-img';
    plantImg.src = data.img;
    plantImg.alt = data.name;
    plantImg.title = data.name;
    plantImg.onerror = () => {
      plantImg.style.display = 'none';
      const fallback = document.createElement('div');
      fallback.textContent = '🌱';
      fallback.style.fontSize = '24px';
      el.appendChild(fallback);
    };
    
    el.appendChild(plantImg); 
    el.appendChild(meta);
    meta.textContent = `${data.name} • HP:${p.hp.toFixed(1)}`;
  } else {
    el.appendChild(meta);
    meta.textContent = '';
  }
}

/* ---------- DRAG AND DROP ---------- */
function setupDragAndDrop() {
  const tools = document.querySelectorAll('.tool');
  console.log(`🔧 Configurando drag & drop para ${tools.length} herramientas`);
  
  tools.forEach(tool => {
    tool.setAttribute('draggable', 'true');
    tool.addEventListener('dragstart', handleDragStart);
  });
}

function handleDragStart(e) {
  const plantType = e.target.dataset.type;
  console.log(`🔄 Iniciando arrastre de: ${plantType}`);
  e.dataTransfer.setData('plantType', plantType);
  e.dataTransfer.effectAllowed = 'copy';
}

function onDropCell(e){
  e.preventDefault();
  const idx = Number(e.currentTarget.dataset.index);
  const plantType = e.dataTransfer.getData('plantType');
  
  console.log(`🎯 Soltando ${plantType} en celda ${idx}`);
  
  if(!plantType || !PLANTS[plantType]) { 
    addLog('Tipo de planta inválido'); 
    mascotaHabla('Ese objeto no se puede colocar'); 
    return; 
  }
  
  if(state.cells[idx].plant) { 
    addLog('Casilla ocupada'); 
    mascotaHabla('Esta casilla ya tiene una planta'); 
    return; 
  }
  
  const plant = PLANTS[plantType];
  if(state.dinero < plant.cost){ 
    addLog('No hay dinero suficiente'); 
    mascotaHabla('No tienes suficiente dinero para construir esta planta'); 
    return; 
  }

  state.dinero -= plant.cost;
  state.cells[idx].plant = {
    type: plantType, 
    hp: 3, 
    _destroying: false
  };
  
  state.contaminacion = clamp(state.contaminacion + plant.contChange, 0, 500);
  
  let deltaFel = 0;
  if(typeof plant.clean === 'number') deltaFel += plant.clean * 0.4;
  if(typeof plant.happiness === 'number') deltaFel += plant.happiness;
  state.felicidad = clamp(state.felicidad + deltaFel, 0, 100);

  addLog(`Construido ${plant.name} en casilla ${idx}.`);
  mascotaHabla(mascotaFelicita('planta'));
  renderCell(idx);
  renderAllStats();
  checkMissionProgress();
  checkLevelCompletion();
}

function onCellClick(e){
  const idx = Number(e.currentTarget.dataset.index);
  const enemy = state.enemies.find(en => Math.floor(en.pos) === idx);
  
  if(enemy){
    const rewardAmt = enemy.reward || 10;
    state.dinero += rewardAmt;
    addLog(`Atacaste a ${enemy.type} y lo eliminaste! (+${rewardAmt})`);
    mascotaHabla(mascotaFelicita('enemigo'));
    
    const tableroEl = document.getElementById('tablero');
    if(tableroEl){
      const cellEl = tableroEl.children[idx];
      if(cellEl){
        const enemyImg = cellEl.querySelector('.enemy-img');
        if(enemyImg) {
          enemyImg.style.animation = 'none';
          setTimeout(() => {
            enemyImg.style.animation = 'enemyHit 0.4s ease-in forwards';
          }, 10);
        }
      }
    }
    
    state.enemies = state.enemies.filter(en => en !== enemy);
    renderEnemies();
    renderAllStats();
    return;
  }
  
  const p = state.cells[idx].plant;
  if(p) {
    addLog(`Casilla ${idx}: planta ${p.type}, HP:${p.hp.toFixed(1)}`);
    mascotaHabla(`Esta planta ${PLANTS[p.type].name} tiene ${p.hp.toFixed(1)} puntos de vida.`);
  }
  else {
    addLog(`Casilla ${idx}: vacía`);
    mascotaHabla('Casilla vacía. ¡Puedes construir aquí!');
  }
}

/* ---------- Sistema de Enemigos ---------- */
function renderEnemies(){
  const tableroEl = document.getElementById('tablero');
  const enemyListEl = document.getElementById('enemyList');
  
  // Limpiar enemigos anteriores del tablero
  if(tableroEl) {
    document.querySelectorAll('.enemy-overlay-centered').forEach(el => el.remove());
  }
  
  if(enemyListEl) enemyListEl.innerHTML = '';

  state.enemies.forEach((en, i) => {
    if(enemyListEl){
      const div = document.createElement('div'); 
      div.className = 'enemy';
      const imgL = document.createElement('img'); 
      imgL.src = en.emojiSrc;
      imgL.style.width = '36px';
      imgL.onerror = () => { 
        imgL.style.display = 'none';
        const fallback = document.createElement('div');
        fallback.textContent = '👾';
        fallback.style.fontSize = '24px';
        div.appendChild(fallback);
      };
      div.appendChild(imgL);
      
      const enemyText = `<strong>${en.type}</strong> (pos:${Math.floor(en.pos)})`;
      const span = document.createElement('span'); 
      span.innerHTML = enemyText;
      div.appendChild(span);
      enemyListEl.appendChild(div);
    }

    const idx = Math.floor(en.pos);
    if(tableroEl && idx >= 0 && idx < TOTAL){
      const cell = tableroEl.children[idx];
      const overlay = document.createElement('div'); 
      overlay.className = 'enemy-overlay-centered';
      
      const eimg = document.createElement('img');
      eimg.className = 'enemy-img';
      eimg.src = en.emojiSrc;
      eimg.alt = en.type;
      eimg.onerror = () => { 
        eimg.style.display = 'none';
        const fallback = document.createElement('div');
        fallback.textContent = '👾';
        fallback.className = 'enemy-img';
        fallback.style.fontSize = '20px';
        overlay.appendChild(fallback);
      };
      
      eimg.addEventListener('click', (ev) => {
        ev.stopPropagation();
        const rewardAmt = en.reward || 10;
        state.dinero += rewardAmt;
        addLog(`❌ Eliminaste ${en.type} +${rewardAmt} monedas`);
        mascotaHabla(mascotaFelicita('enemigo'));
        
        eimg.style.animation = 'none';
        setTimeout(() => {
          eimg.style.animation = 'enemyHit 0.4s ease-in forwards';
        }, 10);
        
        setTimeout(() => {
          state.enemies = state.enemies.filter(x => x !== en);
          renderEnemies(); 
          renderAllStats(); 
        }, 400);
      });

      overlay.appendChild(eimg);
      
      if(getComputedStyle(cell).position === 'static') {
        cell.style.position = 'relative';
      }
      
      cell.appendChild(overlay);
    }
  });
}

function spawnEnemy(){
  if (!state.gameStarted) {
    return;
  }
  
  const tpl = ENEMIES_POOL[Math.floor(Math.random() * ENEMIES_POOL.length)];
  const row = Math.floor(Math.random() * ROWS);
  const startPos = (row * COLS) + (COLS - 1);
  
  const spawn = {
    id: Date.now() + Math.random(),
    type: tpl.id,
    emojiSrc: tpl.emojiSrc,
    power: tpl.power,
    moneyDamage: tpl.moneyDamage,
    contAdd: tpl.contAdd,
    speed: tpl.speed,
    pos: startPos,
    row: row,
    reward: tpl.reward,
    shouldRemove: false
  };
  
  state.enemies.push(spawn);
  addLog(`¡Apareció enemigo: ${spawn.type}! Fila ${row + 1}`);
  
  if (state.enemies.length === 1) {
    mascotaHabla('¡Cuidado! Apareció un enemigo. Haz clic en él para eliminarlo.');
  }
  
  renderEnemies();
}

/* ---------- TICK del juego ---------- */
function tick(){
  if (!state.gameStarted) {
    return;
  }

  state.ticks++;

  // Alertas de la mascota cada 20 segundos
  if(state.ticks % 20 === 0){
    if(state.felicidad < 40){
      mascotaHabla("La gente está triste 😢. Construye más plantas limpias.");
    }
    if(state.dinero < 60){
      mascotaHabla("Dinero bajo 💰. Elimina enemigos para ganar monedas.");
    }
    if(state.contaminacion > 70){
      mascotaHabla("Contaminación alta 🌫️. Prioriza plantas que reduzcan contaminación.");
    }
  }

  // Consejos aleatorios de la mascota
  if(state.ticks % 15 === 0 && Math.random() > 0.7){
    mascotaHabla(mascotaAconseja());
  }

  // Movimiento de enemigos
  state.enemies.forEach(en => {
    const currentCol = Math.floor(en.pos) % COLS;
    
    if (currentCol > 0) {
      en.pos -= 1;
    } else {
      addLog(`${en.type} escapó por la izquierda en fila ${en.row + 1}`);
      en.shouldRemove = true;
      return;
    }
    
    const idx = Math.floor(en.pos);
    
    if(idx >= 0 && idx < TOTAL){
      const plantObj = state.cells[idx].plant;
      if(plantObj){
        const plantRow = Math.floor(idx / COLS);
        if (plantRow === en.row) {
          plantObj.hp -= en.power || 1;
          
          addLog(`${en.type} atacó planta ${plantObj.type} en fila ${en.row + 1} (HP ${plantObj.hp.toFixed(1)})`);
          mascotaHabla(`¡Alerta! Un enemigo atacó nuestra planta ${PLANTS[plantObj.type].name}.`);
          
          state.dinero = Math.max(0, state.dinero - (en.moneyDamage || 0));
          state.contaminacion = clamp(state.contaminacion + (en.contAdd || 0), 0, 500);
          state.felicidad = clamp(state.felicidad - Math.floor((en.power || 1) * 4), 0, 100);

          en.shouldRemove = true;

          if(plantObj.hp <= 0 && !plantObj._destroying){
            destroyPlant(idx, plantObj);
          }
        }
      }
    }
  });

  state.enemies = state.enemies.filter(en => !en.shouldRemove);

  // Actualizar UI
  renderAllStats();
  renderEnemies();
  checkMissionProgress();
  checkLevelCompletion();
  checkGameOver();
}

function destroyPlant(idx, plantObj){
  plantObj._destroying = true;
  const tableroEl = document.getElementById('tablero');
  if(!tableroEl) return;
  
  const cellEl = tableroEl.children[idx];
  if(cellEl){
    cellEl.style.animation = 'plantDestroy 0.7s ease-in forwards';
    setTimeout(() => {
      if(state.cells[idx] && state.cells[idx].plant && state.cells[idx].plant._destroying){
        state.cells[idx].plant = null;
        addLog(`La planta fue destruida en casilla ${idx}`);
        mascotaHabla('¡Oh no! Perdimos una planta. ¡Tenemos que defender mejor nuestra ciudad!');
        renderCell(idx);
      }
    }, 700);
  } else {
    state.cells[idx].plant = null;
  }
}

/* ---------- Sistema de Misiones ---------- */
function assignMissionForLevel(levelIdx){
  const lvl = LEVELS[Math.min(levelIdx, LEVELS.length - 1)];
  state.mission = lvl.mission ? Object.assign({}, lvl.mission) : null;
  renderAllStats();
  
  if(state.mission) {
    addLog(`Nueva misión: ${state.mission.text}`);
    mascotaHabla(`📢 ¡Nueva misión! ${state.mission.text}`);
  }
}

function checkMissionProgress(){
  if(!state.mission) return;
  
  const levelIdx = Math.min(state.nivel - 1, LEVELS.length - 1);
  const objs = LEVELS[levelIdx].objectives || [];
  const all = objs.every(o => o.chk(state));
  
  if(all){
    const rew = LEVELS[levelIdx].mission && LEVELS[levelIdx].mission.reward;
    if(rew){ 
      state.dinero += (rew.dinero || 0); 
      state.felicidad = clamp(state.felicidad + (rew.felicidad || 0), 0, 100); 
    }
    
    addLog(`Misión completada: ${LEVELS[levelIdx].mission.text}`);
    mascotaHabla(mascotaFelicita('nivel'));
    state.mission = null;
    state.missionCompleted = true;
  }
}

function checkLevelCompletion(){
  const levelIdx = Math.min(state.nivel - 1, LEVELS.length - 1);
  const objectives = LEVELS[levelIdx].objectives || [];
  
  console.log(`🎯 Verificando nivel ${state.nivel}:`, objectives.map(o => ({text: o.text, completado: o.chk(state)})));
  
  const done = objectives.reduce((acc, o) => acc + (o.chk(state) ? 1 : 0), 0);
  const total = objectives.length;
  
  console.log(`📊 Progreso: ${done}/${total} objetivos completados`);

  const objetivoHeader = document.getElementById('objetivoHeader');
  if(objetivoHeader) {
    const levelName = LEVELS[levelIdx].name || `Nivel ${state.nivel}`;
    objetivoHeader.textContent = `${levelName}: ${objectives.map(o => o.text).join(' · ')}`;
  }

  if(done === total && total > 0){
    console.log(`🎉 ¡Nivel ${state.nivel} completado!`);
    addLog(`🎉 Nivel ${state.nivel} completado!`);
    mascotaHabla(mascotaFelicita('nivel'));
    
    state.nivel++;
    
    if(state.nivel > LEVELS.length){
      addLog('🏆 ¡JUEGO COMPLETADO! ¡ERES UN MAESTRO DE LA ENERGÍA SOSTENIBLE!');
      mascotaHabla(`🏆 ¡INCREÍBLE ${state.playerName}! Has completado todos los niveles. ¡Eres un verdadero héroe ecológico!`);
      stopSpawning();
    } else {
      addLog(`🚀 Comenzando ${LEVELS[state.nivel - 1].name}`);
      mascotaHabla(`¡Excelente ${state.playerName}! Avanzas al ${LEVELS[state.nivel - 1].name}.`);
      assignMissionForLevel(state.nivel - 1);
    }
    renderAllStats();
  }
}

/* ---------- Renderizado de Estadísticas ---------- */
function renderAllStats(){
  const dineroEl = document.getElementById('dinero');
  const contEl = document.getElementById('contaminacion');
  const felEl = document.getElementById('felicidad');
  const nivelEl = document.getElementById('nivel');
  const missionTextEl = document.getElementById('missionText');
  
  if(dineroEl) dineroEl.textContent = Math.round(state.dinero);
  if(contEl) contEl.textContent = Math.round(state.contaminacion);
  if(felEl) felEl.textContent = Math.round(state.felicidad);
  if(nivelEl) nivelEl.textContent = state.nivel;
  
  const lvl = LEVELS[Math.min(state.nivel - 1, LEVELS.length - 1)];
  if(missionTextEl) {
    if(state.mission) missionTextEl.textContent = `Misión: ${state.mission.text}`; 
    else missionTextEl.textContent = '';
  }
  
  // Actualizar barra de progreso
  updateProgressBars();
}

/* ---------- Sistema de Game Over ---------- */
function checkGameOver(){
  if(state.contaminacion >= 200){ 
    addLog('Game Over: contaminación extrema'); 
    mascotaHabla('😢 La contaminación es demasiado alta... la ciudad colapsó. ¡Intentemos de nuevo!');
    resetGame(); 
  }
  else if(state.felicidad <= 10){ 
    addLog('Game Over: población colapsada'); 
    mascotaHabla('😭 La gente está demasiado triste... tenemos que hacer algo mejor.');
    resetGame(); 
  }
  else if(state.dinero <= 0 && totalPlants(state) === 0){ 
    addLog('Game Over: sin dinero'); 
    mascotaHabla('💸 Nos quedamos sin dinero y sin plantas... ¡empecemos de nuevo!');
    resetGame(); 
  }
}

function resetGame(){
  state.dinero = 200; 
  state.contaminacion = 15; 
  state.felicidad = 100; 
  state.nivel = 1;
  state.cells = Array(TOTAL).fill().map(() => ({plant: null}));
  state.enemies = []; 
  state.ticks = 0; 
  state.achievements = new Set();
  state.mission = null;
  state.gameStarted = false;
  state.missionCompleted = false;
  finalBossDefeated = false;
  miniBossDefeated = false;
  
  const achievementsEl = document.getElementById('achievements');
  const enemyListEl = document.getElementById('enemyList');
  const logEl = document.getElementById('log');
  
  if(achievementsEl) achievementsEl.innerHTML = ''; 
  if(enemyListEl) enemyListEl.innerHTML = ''; 
  if(logEl) logEl.innerHTML = '';
  
  renderAllStats(); 
  initBoard(); 
  stopSpawning();
  
  assignMissionForLevel(0);
  mascotaHabla('¡Nueva partida comenzada! Aprendamos de nuestros errores.');
}

/* ---------- INICIO DEL JUEGO ---------- */
function startGame(){
  console.log('🎯 Botón iniciar clickeado');
  
  if(mainTickInterval) { 
    addLog('El juego ya está en ejecución.'); 
    return; 
  }
  
  if (state.gameStarted) {
    addLog('El juego ya fue iniciado.');
    return;
  }
  
  console.log('🚀 INICIANDO JUEGO...');
  
  state.gameStarted = true;
  
  // INICIAR SISTEMAS
  startSpawning();
  mainTickInterval = setInterval(tick, 1000);
  
  addLog('🎮 ¡JUEGO INICIADO! Construye tu primera planta.');
  mascotaHabla(`¡El juego ha comenzado ${state.playerName}! ¡Cuida tu ciudad y mantén el equilibrio ecológico!`);
  
  // PRIMER ENEMIGO A LOS 3 SEGUNDOS
  setTimeout(() => {
    if(state.gameStarted) {
      spawnEnemy();
      addLog('⚡ ¡Primer enemigo apareció!');
    }
  }, 3000);
}

function startSpawning(){
  if(spawnTimer) clearInterval(spawnTimer);
  spawnTimer = setInterval(() => {
    if (state.gameStarted) spawnEnemy();
  }, 3000);
}

function stopSpawning(){ 
  if(spawnTimer) {
    clearInterval(spawnTimer); 
    spawnTimer = null;
  }
}

/* ---------- Configuración de Event Listeners ---------- */
function setupEventListeners() {
  console.log('🔧 Configurando event listeners...');
  
  const btnStart = document.getElementById('startBtn');
  if (btnStart) {
    btnStart.addEventListener('click', startGame);
    console.log('✅ Botón iniciar configurado');
  }

  // Configurar drag and drop
  setupDragAndDrop();
  
  console.log('✅ Event listeners configurados');
}

// Power-ups del juego
function buyPowerUp(type) {
    const cost = { bono: 50, limpieza: 40, felicidad: 30 }[type];
    
    if (state.dinero < cost) {
        mascotaHabla(`❌ No tienes suficiente dinero para este power-up`);
        return;
    }

    state.dinero -= cost;

    switch(type) {
        case 'bono':
            state.dinero += 80;
            mascotaHabla('💰 ¡Bono ecológico recibido! +80 monedas');
            break;
        case 'limpieza':
            state.contaminacion = Math.max(0, state.contaminacion - 25);
            mascotaHabla('🧹 ¡Limpieza express! -25% contaminación');
            break;
        case 'felicidad':
            state.felicidad = Math.min(100, state.felicidad + 20);
            mascotaHabla('🎉 ¡Fiesta comunitaria! +20% felicidad');
            break;
    }

    renderAllStats();
}

// Funciones globales para los botones
window.buyPowerUp = buyPowerUp;
window.showDetailedStats = function() {
    const progress = computeLevelProgress();
    alert(`Estadísticas detalladas:\n\n` +
          `Nivel: ${state.nivel}\n` +
          `Progreso: ${progress}%\n` +
          `Plantas totales: ${totalPlants(state)}\n` +
          `Plantas limpias: ${countPlants(state,'solar')+countPlants(state,'eolica')+countPlants(state,'hidro')+countPlants(state,'geotermica')+countPlants(state,'biomasa')}\n` +
          `Contaminantes: ${countPlants(state,'carbon')+countPlants(state,'petroleo')}\n` +
          `Enemigos activos: ${state.enemies.length}`);
};

window.startTutorial = function() {
    mostrarInstruccionesIniciales();
};

window.debugGame = function() {
    console.log('=== DEBUG DEL JUEGO ===');
    console.log('Estado:', state);
    console.log('Usuario:', window.userSystem?.currentUser);
    console.log('Partidas guardadas:', window.userSystem?.loadGames()?.length);
    console.log('Nivel actual:', state.nivel);
    console.log('Objetivos del nivel:', LEVELS[Math.min(state.nivel-1, LEVELS.length-1)]?.objectives?.map(o => ({text: o.text, completado: o.chk(state)})));
    console.log('=====================');
    mascotaHabla('🐛 Información de debug en la consola');
};

/* ---------- Inicialización Final ---------- */
// Esperar a que el DOM esté completamente cargado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGame);
} else {
    initializeGame();
}

// Hacer funciones disponibles globalmente
window.startGame = startGame;
window.loadGame = loadGame;
window.deleteGame = deleteGame;
window.mascotaHabla = mascotaHabla;
window.saveCurrentGame = saveCurrentGame;
window.showSavedGames = showSavedGames;
window.debugGame = debugGame;