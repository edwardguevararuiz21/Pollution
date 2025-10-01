document.addEventListener("DOMContentLoaded", () => { 
  const datos = [
    "🌞 El Sol podría cubrir toda la energía del planeta en solo una hora.",
    "💧 El agua cubre el 70% de la Tierra, pero solo el 3% es dulce.",
    "🌬 El viento más fuerte registrado alcanzó 408 km/h.",
    "♻ Reciclar una lata de aluminio ahorra energía suficiente para ver TV por 3 horas.",
    "🐢 Una tortuga marina puede vivir más de 100 años.",
    "⚡ La energía solar es la fuente renovable más utilizada en el mundo.",
    "🌱 Plantar árboles ayuda a limpiar el aire de CO₂.",
    "🚲 Andar en bicicleta no contamina y es buen ejercicio.",
    "🔥 La biomasa aprovecha restos orgánicos como fuente de energía.",
    "💡 Cambiar un foco normal por uno LED ahorra un 80% de energía.",
    "🌍 La capa de ozono protege la Tierra de los rayos del Sol.",
    "🌀 Los molinos de viento modernos pueden medir más de 200 metros.",
    "📚 Aprender sobre el agua ayuda a cuidar la vida de todos los seres vivos.",
    "🐝 Las abejas son responsables de polinizar el 75% de nuestros alimentos.",
    "🚰 Cerrar el grifo al cepillarte los dientes ahorra hasta 12 litros por minuto.",
    "🌳 Un árbol grande puede producir oxígeno para 4 personas en un día.",
    "🎐 Los parques eólicos marinos producen más energía que los de tierra.",
    "🐧 El cambio climático afecta a pingüinos y osos polares.",
    "🌋 La energía geotérmica proviene del calor interno de la Tierra.",
    "🔋 Las baterías recicladas evitan contaminar el suelo y el agua."
  ];

  const curiosidadBox = document.getElementById("curiosidadBox");
  const btnPrev = document.getElementById("btnPrev");
  const btnNext = document.getElementById("btnNext");

  let indice = 0;

  function mostrarCuriosidad() {
    curiosidadBox.textContent = datos[indice];
  }

  btnPrev.addEventListener("click", () => {
    indice = (indice - 1 + datos.length) % datos.length;
    mostrarCuriosidad();
  });

  btnNext.addEventListener("click", () => {
    indice = (indice + 1) % datos.length;
    mostrarCuriosidad();
  });

  // inicializamos
  mostrarCuriosidad();
});