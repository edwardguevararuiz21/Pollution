// Inicializar carrito desde localStorage o vacío 
let carrito = JSON.parse(localStorage.getItem("carrito")) || []; 
 
// Mostrar todos los productos al cargar 
mostrarProductos(productos); 
actualizarCarrito(); 
 
// Mostrar productos en el catálogo 
function mostrarProductos(lista) { 
  const contenedor = document.getElementById('catalogo'); 
  contenedor.innerHTML = ""; 
 
  lista.forEach(prod => { 
    const div = document.createElement('div'); 
    div.classList.add('producto'); 
    div.innerHTML = ` 
      <img src="${prod.imagen}" alt="${prod.nombre}" /> 
      <h2>${prod.nombre}</h2> 
      <p>$${prod.precio}</p> 
      <button onclick="agregarAlCarrito(${prod.id})">Agregar al carrito</button> 
    `; 
    contenedor.appendChild(div); 
  }); 
} 
 
// Mostrar todos los productos 
function mostrarTodos() { 
  mostrarProductos(productos); 
} 
 
// Filtrar productos por categoría 
function filtrarPorCategoria(categoria) { 
  const filtrados = productos.filter(p => p.categoria === categoria); 
  mostrarProductos(filtrados); 
} 
 
// Buscar productos por nombre 
function buscarProducto() { 
  const texto = document.getElementById("inputBuscar").value.toLowerCase(); 
  const resultado = productos.filter(p => 
    p.nombre.toLowerCase().includes(texto) 
  ); 
  mostrarProductos(resultado); 
} 
 
// Agregar producto al carrito 
function agregarAlCarrito(id) { 
  const producto = productos.find(p => p.id === id); 
  const existe = carrito.find(p => p.id === id); 
 
  if (existe) { 
    existe.cantidad += 1; 
  } else { 
    carrito.push({ ...producto, cantidad: 1 }); 
  } 
 
  actualizarCarrito(); 
} 
 
// Mostrar contenido del carrito y total 
function actualizarCarrito() { 
  const carritoDiv = document.getElementById("carrito"); 
  const totalDiv = document.getElementById("total"); 
  carritoDiv.innerHTML = ""; let total = 0; 
 
  carrito.forEach(p => { 
    const subtotal = p.precio * p.cantidad; 
    total += subtotal; 
 
    const div = document.createElement("div"); 
    div.innerHTML = ` 
      <strong>${p.nombre}</strong> - $${p.precio} x ${p.cantidad} = 
$${subtotal.toFixed(2)} 
      <button onclick="eliminarDelCarrito(${p.id})">Eliminar</button> 
    `; 
    carritoDiv.appendChild(div); 
  }); 
 
  // Mostrar total 
  totalDiv.textContent = `Total: $${total.toFixed(2)}`; 
 
  // Guardar en localStorage 
  localStorage.setItem("carrito", JSON.stringify(carrito)); 
} 
 
// Eliminar producto del carrito 
function eliminarDelCarrito(id) { 
  carrito = carrito.filter(p => p.id !== id); 
  actualizarCarrito(); 
} 
 
// Vaciar todo el carrito 
function vaciarCarrito() { 
  carrito = []; 
  actualizarCarrito(); 
}