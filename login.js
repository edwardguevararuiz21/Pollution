document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if(!email || !password){
      alert('❗ Completa todos los campos.');
      return;
    }

    // Enviar a login.php
    const fd = new FormData();
    fd.append('email', email);
    fd.append('password', password);

    try {
      const resp = await fetch('login.php', { 
        method: 'POST', 
        body: fd 
      });
      
      const json = await resp.json();

      if(json && json.exito){
        // Guardar datos en localStorage
        localStorage.setItem('usuario_nombre', json.nombre);
        localStorage.setItem('usuario_id', json.id);
        localStorage.setItem('usuario_email', json.email);

        // INTEGRAR CON EL SISTEMA DEL JUEGO
        if (window.integrateWithExistingAuth) {
          window.integrateWithExistingAuth({
            id: json.id,
            username: json.nombre,
            email: json.email
          });
        }

        alert('✅ Sesión iniciada correctamente. Bienvenido/a ' + json.nombre + '!');
        window.location.href = 'Juego.html';
        
      } else {
        const msg = (json && json.mensaje) ? json.mensaje : 'Error al iniciar sesión.';
        alert('⚠️ ' + msg);
      }
    } catch (err) {
      console.error(err);
      alert('❌ Error de conexión con el servidor.');
    }
  });
});