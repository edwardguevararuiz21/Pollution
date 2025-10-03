// script_aside.js - FUNCIONES MEJORADAS SIN INTERFERENCIAS
document.addEventListener("DOMContentLoaded", () => {
  const mensajeMascota = document.getElementById("mensajeMascota");
  const siguienteBtn = document.getElementById("siguienteBtn");
  const mascotaIntro = document.getElementById("mascotaIntro");
  const presentacion = document.getElementById("presentacion");
  const carruselSeccion = document.getElementById("carruselSeccion");
  const historietasSeccion = document.getElementById("historietasSeccion");
  const seccionRecomendada = document.getElementById("seccionRecomendada");
  const seccionObjetivo = document.getElementById("seccionObjetivo");

  // Máquina de escribir
  function maquinaEscribir(elemento, texto, velocidad = 50) {
    return new Promise((resolve) => {
      elemento.textContent = '';
      let i = 0;
      
      function escribir() {
        if (i < texto.length) {
          elemento.textContent += texto.charAt(i);
          i++;
          setTimeout(escribir, velocidad);
        } else {
          resolve();
        }
      }
      
      escribir();
    });
  }

  // Configurar mensaje inicial mejorado
  async function configurarSaludoInicial() {
    let mensaje = "¡Hola! 🐱 Soy EcoGatito, tu guía en esta aventura ecológica.";
    
    if (window.userSystem && window.userSystem.currentUser) {
      const usuario = window.userSystem.currentUser;
      if (usuario.isGuest) {
        mensaje = `¡Hola Invitado! 🎮 Bienvenido al modo de prueba.`;
      } else {
        mensaje = `¡Hola ${usuario.nombre}! 🐱 Soy EcoGatito, tu guía ecológica.`;
      }
    }
    
    await maquinaEscribir(mensajeMascota, mensaje);
  }

  // Inicializar
  (async function() {
    await configurarSaludoInicial();
  })();

  // Botón siguiente
  siguienteBtn.addEventListener("click", () => {
    mascotaIntro.style.display = "none";
    presentacion.style.display = "block";
    carruselSeccion.style.display = "block";
    historietasSeccion.style.display = "block";
    seccionRecomendada.style.display = "block";
    seccionObjetivo.style.display = "block";
    
    iniciarCarrusel();
    mostrarHistorieta(0);
    configurarSeccionRecomendada();
    configurarSeccionObjetivo();
    
    // Destacar sección educativa simplemente
    setTimeout(() => {
      const seccionEducativa = document.querySelector('.seccion-card:first-child');
      if (seccionEducativa) {
        seccionEducativa.classList.add('destacada');
      }
    }, 1000);
  });

  // Historietas educativas - VERSIÓN SIMPLE
  const historietas = [
    {
      texto: "La energía solar 🌞 convierte la luz del sol en electricidad limpia y renovable. ¡Es una fuente infinita de energía!", 
      img: "img/solar-panels-8593759_640.png"
    },
    {
      texto: "La energía eólica 💨 usa la fuerza del viento para mover turbinas gigantes que generan electricidad sin contaminar.", 
      img: "img/molino.png"
    },
    {
      texto: "Aprender sobre energías limpias ayuda a cuidar nuestro planeta 🌍 y garantizar un futuro sostenible para todos.", 
      img: "img/libro.png"
    },
    {
      texto: "¡Te recomiendo empezar por la Sección Educativa 📚 para un aprendizaje más eficiente! Luego podrás disfrutar de los juegos.", 
      img: "img/arbol.png"
    }
  ];
  
  let histIndex = 0;

  async function mostrarHistorieta(i) {
    const mensajeHistorieta = document.getElementById("mensajeHistorieta");
    const ilustracionHistorieta = document.getElementById("ilustracionHistorieta");
    
    if (i < historietas.length) {
      await maquinaEscribir(mensajeHistorieta, historietas[i].texto);
      ilustracionHistorieta.innerHTML = `<img src="${historietas[i].img}" alt="ilustración educativa">`;
    }
  }

  document.getElementById("siguienteHistorietaBtn").addEventListener("click", async () => {
    histIndex++;
    if (histIndex < historietas.length) {
      await mostrarHistorieta(histIndex);
    } else {
      histIndex = 0;
      await mostrarHistorieta(histIndex);
    }
  });

  // Carrusel simple
  function iniciarCarrusel() {
    const images = [
      {
        src: 'img/solar-panels-8593759_640.png', 
        alt: 'Energía Solar', 
        desc: '🌞 Energía Solar - Limpia y renovable'
      },
      {
        src: 'img/wind-turbines-7264970_640.jpg', 
        alt: 'Energía Eólica', 
        desc: '💨 Energía Eólica - Potencia del viento'
      },
      {
        src: 'img/hidro.png', 
        alt: 'Energía Hidroeléctrica', 
        desc: '💧 Energía Hidroeléctrica - Fuerza del agua'
      }
    ];

    const container = document.getElementById('carruselContainer'); 
    container.innerHTML = '';

    images.forEach((img, index) => {
      const slide = document.createElement('div'); 
      slide.className = 'carrusel-slide';
      slide.innerHTML = `
        <img src="${img.src}" alt="${img.alt}" loading="lazy">
        <p class="carrusel-desc">${img.desc}</p>
      `;
      container.appendChild(slide);
    });

    let index = 0;
    const slides = container.querySelectorAll('.carrusel-slide');

    function showSlide(i) {
      slides.forEach((s, idx) => {
        s.style.display = idx === i ? 'flex' : 'none';
      });
    }

    function nextSlide() {
      index = (index + 1) % slides.length;
      showSlide(index);
    }

    showSlide(0);
    setInterval(nextSlide, 4000);
  }

  // SECCIÓN RECOMENDADA - Versión simple
  function configurarSeccionRecomendada() {
    const secciones = [
      {
        icono: '📚',
        titulo: 'Sección Educativa',
        descripcion: 'Aprende sobre energías renovables y cuidado del medio ambiente',
        enlace: 'educativo.html',
        color: '#4caf50'
      },
      {
        icono: '🔠',
        titulo: 'Sopa de Letras',
        descripcion: 'Encuentra palabras relacionadas con la ecología',
        enlace: 'sopa de letras.html',
        color: '#2196f3'
      },
      {
        icono: '🔤',
        titulo: 'Crucigrama',
        descripcion: 'Resuelve puzzles sobre energías limpias',
        enlace: 'Crucigrama.html',
        color: '#ff9800'
      },
      {
        icono: '🎮',
        titulo: 'Juego Principal',
        descripcion: 'Construye tu ciudad ecológica',
        enlace: 'Juego.html',
        color: '#9c27b0'
      }
    ];

    const container = seccionRecomendada.querySelector('.secciones-grid');
    if (!container) return;

    container.innerHTML = '';

    secciones.forEach(seccion => {
      const card = document.createElement('div');
      card.className = 'seccion-card';
      card.style.borderLeft = `4px solid ${seccion.color}`;
      
      card.innerHTML = `
        <div class="seccion-icono" style="color: ${seccion.color}">
          ${seccion.icono}
        </div>
        <div class="seccion-contenido">
          <h3>${seccion.titulo}</h3>
          <p>${seccion.descripcion}</p>
          <a href="${seccion.enlace}" class="btn-seccion" style="background: ${seccion.color}">
            Explorar ➡️
          </a>
        </div>
      `;

      container.appendChild(card);
    });
  }

  // SECCIÓN OBJETIVO - Versión simple
  function configurarSeccionObjetivo() {
    const objetivos = [
      {
        icono: '🌱',
        titulo: 'Aprender sobre energías limpias',
        completado: true,
        descripcion: 'Conoce las diferentes fuentes de energía renovable'
      },
      {
        icono: '💧',
        titulo: 'Cuidar los recursos hídricos',
        completado: false,
        descripcion: 'Aprende a conservar y proteger el agua'
      },
      {
        icono: '♻️',
        titulo: 'Dominar el reciclaje',
        completado: false,
        descripcion: 'Separa correctamente los diferentes tipos de residuos'
      },
      {
        icono: '🏆',
        titulo: 'Convertirte en héroe ecológico',
        completado: false,
        descripcion: 'Completa todas las misiones y desafíos'
      }
    ];

    const container = seccionObjetivo.querySelector('.objetivos-lista');
    if (!container) return;

    container.innerHTML = '';

    objetivos.forEach((objetivo, index) => {
      const item = document.createElement('div');
      item.className = `objetivo-item ${objetivo.completado ? 'completado' : ''}`;
      
      item.innerHTML = `
        <div class="objetivo-icono">
          ${objetivo.icono}
        </div>
        <div class="objetivo-contenido">
          <h4>${objetivo.titulo}</h4>
          <p>${objetivo.descripcion}</p>
        </div>
        <div class="objetivo-estado">
          ${objetivo.completado ? '✅' : '⏳'}
        </div>
      `;

      container.appendChild(item);
    });

    // Barra de progreso simple
    const progresoBar = seccionObjetivo.querySelector('.progreso-bar');
    const progresoTexto = seccionObjetivo.querySelector('.progreso-texto');

    if (progresoBar && progresoTexto) {
      const objetivosCompletados = objetivos.filter(obj => obj.completado).length;
      const porcentaje = (objetivosCompletados / objetivos.length) * 100;
      
      progresoBar.style.width = `${porcentaje}%`;
      progresoTexto.textContent = `${objetivosCompletados}/${objetivos.length} objetivos completados`;
    }
  }

  // Función global para actualizar saludo
  window.actualizarSaludoUsuario = async function() {
    await configurarSaludoInicial();
  };

  console.log('✅ Sistema Pollution inicializado - Versión simple');
});