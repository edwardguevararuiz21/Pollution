document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-registro');
  
  console.log('📝 Inicializando formulario de registro...');

  // Verificar que el sistema de usuarios esté cargado
  if (!window.userSystem) {
    console.error('❌ ERROR: Sistema de usuarios no cargado');
    alert('Error: El sistema de usuarios no se cargó correctamente. Recarga la página.');
    return;
  }

  console.log('✅ Sistema de usuarios cargado correctamente');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('🔄 Procesando formulario de registro...');

    // Obtener datos del formulario
    const nombre = document.getElementById('nombre').value.trim();
    const apellido = document.getElementById('apellido').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const email = document.getElementById('email').value.trim().toLowerCase();
    const confirmar_email = document.getElementById('confirmar_email').value.trim().toLowerCase();
    const password = document.getElementById('password').value;
    const confirmar = document.getElementById('confirmar').value;

    console.log('📧 Datos del formulario:', { nombre, apellido, email });

    // Validaciones básicas
    if (!nombre || !email || !password) {
      alert('❗ Completa todos los campos obligatorios (Nombre, Email, Contraseña).');
      return;
    }
    
    if (email !== confirmar_email) {
      alert('❌ Los correos electrónicos no coinciden.');
      return;
    }
    
    if (password !== confirmar) {
      alert('❌ Las contraseñas no coinciden.');
      return;
    }

    if (password.length < 4) {
      alert('❌ La contraseña debe tener al menos 4 caracteres.');
      return;
    }

    // Preparar datos del usuario
    const userData = {
      nombre,
      apellido,
      telefono,
      email,
      password
    };

    try {
      console.log('👤 Intentando registrar usuario...');
      
      // Mostrar mensaje de carga
      const submitBtn = form.querySelector('input[type="submit"]');
      const originalText = submitBtn.value;
      submitBtn.value = 'Registrando...';
      submitBtn.disabled = true;

      // Registrar usuario usando el sistema
      const result = await window.userSystem.registerUser(userData);
      
      // Restaurar botón
      submitBtn.value = originalText;
      submitBtn.disabled = false;

      console.log('📨 Resultado del registro:', result);

      if (result.success) {
        let mensajeExito = `✅ ${result.method === 'server' ? 'Cuenta creada en el servidor' : 'Cuenta creada localmente'} correctamente.\n\n¡Bienvenido/a ${result.user.nombre}!`;
        
        if (result.message) {
          mensajeExito += `\n\n${result.message}`;
        }

        alert(mensajeExito);
        console.log('🎉 Registro exitoso, redirigiendo...');

        // Redirigir al inicio después de 2 segundos
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 2000);
        
      } else {
        alert('❌ Error al registrar: ' + (result.message || 'No se pudo crear la cuenta.'));
        console.error('❌ Error en registro:', result.message);
      }

    } catch (err) {
      console.error('❌ Error crítico en el registro:', err);
      alert('❌ Error crítico al registrar: ' + err.message);
      
      // Restaurar botón en caso de error
      const submitBtn = form.querySelector('input[type="submit"]');
      submitBtn.value = 'Enviar';
      submitBtn.disabled = false;
    }
  });

  // Agregar validación en tiempo real para emails
  const emailInput = document.getElementById('email');
  const confirmEmailInput = document.getElementById('confirmar_email');

  function validateEmails() {
    const email = emailInput.value.trim().toLowerCase();
    const confirmEmail = confirmEmailInput.value.trim().toLowerCase();
    
    if (email && confirmEmail && email !== confirmEmail) {
      confirmEmailInput.style.borderColor = 'red';
    } else {
      confirmEmailInput.style.borderColor = '';
    }
  }

  emailInput.addEventListener('input', validateEmails);
  confirmEmailInput.addEventListener('input', validateEmails);

  console.log('✅ Formulario de registro configurado correctamente');
});