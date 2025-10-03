// user-system.js - Sistema unificado MEJORADO con registro automático
class UserSystem {
    constructor() {
        this.currentUser = null;
        this.useLocalStorage = false;
        this.serverAvailable = null;
        this.init();
    }

    init() {
        console.log('🔄 Inicializando sistema de usuarios Pollution...');
        this.verificarSistemaCompleto();
        this.loadFromLocalStorage();
        this.updateUI();
        this.setupGlobalEventListeners();
        
        // Verificar si hay usuario registrado y redirigir automáticamente
        this.verificarUsuarioRegistrado();
    }

    // Verificar si ya hay un usuario registrado para entrar automáticamente
    verificarUsuarioRegistrado() {
        if (this.currentUser && !this.currentUser.isGuest) {
            console.log(`✅ Usuario ${this.currentUser.nombre} detectado - Acceso automático`);
            this.mostrarSaludoPersonalizado();
            
            // Si estamos en página de registro, redirigir al index
            if (window.location.pathname.includes('CrearCuenta.html')) {
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            }
        }
    }

    // Verificación completa del sistema
    verificarSistemaCompleto() {
        console.group('🔍 VERIFICACIÓN DEL SISTEMA DE USUARIOS');
        
        // Verificar localStorage
        try {
            localStorage.setItem('pollution_test', 'test_value');
            const testValue = localStorage.getItem('pollution_test');
            localStorage.removeItem('pollution_test');
            
            if (testValue === 'test_value') {
                console.log('✅ localStorage funcionando correctamente');
            } else {
                console.warn('⚠️ localStorage tiene problemas de lectura/escritura');
            }
        } catch (e) {
            console.error('❌ localStorage no disponible:', e.message);
        }
        
        // Verificar conexión a servidor
        this.verificarServidor()
            .then(disponible => {
                this.serverAvailable = disponible;
                if (disponible) {
                    console.log('✅ Servidor PHP disponible y funcionando');
                } else {
                    console.warn('⚠️ Servidor PHP no disponible - Usando modo localStorage');
                }
            })
            .catch(error => {
                console.error('❌ Error verificando servidor:', error);
                this.serverAvailable = false;
            });
        
        console.groupEnd();
    }

    async verificarServidor() {
        try {
            const response = await fetch('procesar.php', {
                method: 'HEAD',
                cache: 'no-cache',
                timeout: 5000
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    setupGlobalEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('stats-btn') || 
                e.target.closest('.stats-btn')) {
                e.preventDefault();
                this.showUserStats();
            }
            
            if (e.target.classList.contains('guest-btn') || 
                e.target.closest('.guest-btn')) {
                e.preventDefault();
                this.startAsGuest();
            }
            
            if (e.target.classList.contains('logout-btn') || 
                e.target.closest('.logout-btn')) {
                e.preventDefault();
                this.logout();
            }
        });
    }

    // 🔄 Sistema de autenticación mejorado - REGISTRO AUTOMÁTICO
    async authenticateUser(email, password) {
        console.log('🔐 Intentando autenticar usuario:', email);
        
        // Primero intentar con el servidor si está disponible
        if (this.serverAvailable !== false) {
            let serverResult = null;
            try {
                serverResult = await this.serverLogin(email, password);
                if (serverResult.success) {
                    console.log('✅ Autenticación exitosa por servidor');
                    return serverResult;
                }
            } catch (error) {
                console.log('❌ Servidor no disponible para login:', error.message);
                this.serverAvailable = false;
            }
        }

        // Fallback a localStorage
        console.log('🔄 Intentando autenticación local...');
        const localResult = this.localStorageLogin(email, password);
        
        if (localResult.success) {
            console.log('✅ Autenticación exitosa por localStorage');
            return localResult;
        }

        console.log('❌ Autenticación fallida en ambos métodos');
        return { success: false, message: 'Credenciales incorrectas' };
    }

    async serverLogin(email, password) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const response = await fetch('procesar.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) throw new Error('Error del servidor: ' + response.status);
            
            const result = await response.json();
            console.log('📡 Respuesta del servidor:', result);
            
            if (result.exito) {
                this.currentUser = {
                    id: result.id,
                    nombre: result.nombre,
                    email: result.email,
                    apellido: result.apellido || '',
                    telefono: result.telefono || '',
                    serverId: result.id,
                    isGuest: false
                };
                this.useLocalStorage = false;
                this.saveToLocalStorage();
                this.updateUI();
                this.mostrarSaludoPersonalizado();
                
                // Redirigir automáticamente al index si está en registro
                if (window.location.pathname.includes('CrearCuenta.html')) {
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1500);
                }
                
                return { success: true, user: this.currentUser, method: 'server' };
            } else {
                throw new Error(result.mensaje || 'Error de autenticación');
            }
        } catch (error) {
            console.error('❌ Error en serverLogin:', error);
            throw error;
        }
    }

    // 📝 REGISTRO MEJORADO - Entra automáticamente después de registrar
    async registerUser(userData) {
        console.log('📝 Intentando registrar usuario:', userData.email);
        
        // Primero intentar con el servidor si está disponible
        if (this.serverAvailable !== false) {
            let serverResult = null;
            try {
                serverResult = await this.serverRegister(userData);
                if (serverResult.success) {
                    console.log('✅ Registro exitoso por servidor');
                    
                    // ENTRAR AUTOMÁTICAMENTE después del registro
                    this.autoLoginAfterRegister(userData.email, userData.password);
                    return serverResult;
                }
            } catch (error) {
                console.log('❌ Servidor no disponible para registro:', error.message);
                this.serverAvailable = false;
            }
        }

        // Fallback a localStorage
        console.log('🔄 Intentando registro local...');
        const localResult = this.localStorageRegister(userData);
        
        if (localResult.success) {
            console.log('✅ Registro exitoso por localStorage');
            
            // ENTRAR AUTOMÁTICAMENTE después del registro
            this.autoLoginAfterRegister(userData.email, userData.password);
            return localResult;
        }

        console.log('❌ Registro fallido en ambos métodos');
        return localResult;
    }

    // 🔑 ENTRADA AUTOMÁTICA después del registro
    async autoLoginAfterRegister(email, password) {
        console.log('🔑 Ejecutando entrada automática después del registro...');
        
        try {
            // Pequeña pausa para asegurar que el registro se complete
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Intentar login automático
            const loginResult = await this.authenticateUser(email, password);
            
            if (loginResult.success) {
                console.log('✅ Entrada automática exitosa después del registro');
                
                // Mostrar mensaje de éxito
                if (window.mascotaHabla) {
                    window.mascotaHabla(`¡Bienvenido ${this.currentUser.nombre}! 🎉 Tu cuenta ha sido creada y has entrado automáticamente.`);
                }
                
                // Redirigir al index después de 2 segundos
                setTimeout(() => {
                    if (window.location.pathname.includes('CrearCuenta.html')) {
                        window.location.href = 'index.html';
                    }
                }, 2000);
                
            } else {
                console.warn('⚠️ No se pudo hacer entrada automática, pero el registro fue exitoso');
            }
        } catch (error) {
            console.error('❌ Error en entrada automática:', error);
        }
    }

    async serverRegister(userData) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const formData = new URLSearchParams();
            formData.append('nombre', userData.nombre);
            formData.append('apellido', userData.apellido || '');
            formData.append('telefono', userData.telefono || '');
            formData.append('email', userData.email);
            formData.append('password', userData.password);

            const response = await fetch('procesar.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) throw new Error('Error del servidor: ' + response.status);
            
            const result = await response.json();
            console.log('📡 Respuesta del servidor (registro):', result);
            
            if (result.exito) {
                return { 
                    success: true, 
                    user: {
                        id: result.id,
                        nombre: result.nombre,
                        email: result.email,
                        apellido: userData.apellido || '',
                        telefono: userData.telefono || '',
                        serverId: result.id,
                        isGuest: false
                    }, 
                    method: 'server',
                    message: 'Usuario registrado correctamente en el servidor'
                };
            } else {
                throw new Error(result.mensaje || 'Error en el registro');
            }
        } catch (error) {
            console.error('❌ Error en serverRegister:', error);
            throw error;
        }
    }

    // 💾 MÉTODOS LOCALSTORAGE
    localStorageLogin(email, password) {
        try {
            const usersJSON = localStorage.getItem('pollution_users');
            if (!usersJSON) {
                return { success: false, message: 'No hay usuarios registrados localmente' };
            }

            const users = JSON.parse(usersJSON);
            const user = Object.values(users).find(u => u.email === email);

            if (!user) {
                return { success: false, message: 'Usuario no encontrado en almacenamiento local' };
            }

            if (user.password !== password) {
                return { success: false, message: 'Contraseña incorrecta' };
            }

            this.currentUser = { 
                id: user.id,
                nombre: user.nombre,
                email: user.email,
                apellido: user.apellido,
                telefono: user.telefono,
                isGuest: false
            };
            this.useLocalStorage = true;
            
            this.saveToLocalStorage();
            this.updateUI();
            this.mostrarSaludoPersonalizado();

            // Actualizar saludo en la página principal
            if (window.actualizarSaludoUsuario) {
                window.actualizarSaludoUsuario();
            }

            // Redirigir automáticamente al index si está en registro
            if (window.location.pathname.includes('CrearCuenta.html')) {
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            }

            return { success: true, user: this.currentUser, method: 'localStorage' };

        } catch (error) {
            console.error('❌ Error en localStorageLogin:', error);
            return { success: false, message: 'Error al acceder a los datos locales' };
        }
    }

    localStorageRegister(userData) {
        try {
            const usersJSON = localStorage.getItem('pollution_users');
            const users = usersJSON ? JSON.parse(usersJSON) : {};

            const emailExiste = Object.values(users).some(u => u.email === userData.email);
            if (emailExiste) {
                return { success: false, message: 'El email ya está registrado localmente' };
            }

            const userId = 'user_' + Date.now();
            const newUser = {
                id: userId,
                nombre: userData.nombre,
                apellido: userData.apellido || '',
                telefono: userData.telefono || '',
                email: userData.email,
                password: userData.password,
                fechaRegistro: new Date().toISOString()
            };

            users[userId] = newUser;
            localStorage.setItem('pollution_users', JSON.stringify(users));
            
            return { 
                success: true, 
                user: {
                    id: newUser.id,
                    nombre: newUser.nombre,
                    email: newUser.email,
                    apellido: newUser.apellido,
                    telefono: newUser.telefono,
                    isGuest: false
                }, 
                method: 'localStorage',
                message: 'Usuario registrado correctamente en modo local'
            };

        } catch (error) {
            console.error('❌ Error en localStorageRegister:', error);
            return { success: false, message: 'Error al registrar en almacenamiento local' };
        }
    }

    // 💾 SISTEMA DE GUARDADO DE PARTIDAS
    saveGame(gameData) {
        try {
            if (!this.currentUser) {
                console.error('❌ No hay usuario logueado para guardar partida');
                return false;
            }

            console.log('💾 Guardando partida para:', this.currentUser.nombre);
            
            // Guardar en localStorage (siempre)
            const savedGamesJSON = localStorage.getItem('pollution_saved_games');
            const savedGames = savedGamesJSON ? JSON.parse(savedGamesJSON) : {};
            
            const userGames = savedGames[this.currentUser.id] || [];

            // Limitar a 5 partidas guardadas
            if (userGames.length >= 5) {
                userGames.shift();
            }

            const gameSave = {
                id: 'save_' + Date.now(),
                timestamp: new Date().toISOString(),
                data: gameData,
                level: gameData.nivel,
                money: gameData.dinero,
                pollution: gameData.contaminacion,
                happiness: gameData.felicidad
            };

            userGames.push(gameSave);
            savedGames[this.currentUser.id] = userGames;
            localStorage.setItem('pollution_saved_games', JSON.stringify(savedGames));

            console.log('✅ Partida guardada en localStorage');

            // Intentar guardar en servidor si no es modo local
            if (!this.useLocalStorage && this.currentUser.serverId && this.serverAvailable) {
                this.serverSaveGame(gameData).catch(error => {
                    console.log('⚠️ No se pudo guardar en servidor, pero se guardó localmente');
                });
            }

            return true;

        } catch (error) {
            console.error('❌ Error al guardar partida:', error);
            return false;
        }
    }

    async serverSaveGame(gameData) {
        try {
            const response = await fetch('guardar_partida.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    usuario_id: this.currentUser.serverId,
                    game_data: gameData
                })
            });

            if (!response.ok) throw new Error('Error del servidor');
            
            const result = await response.json();
            return result.success;
            
        } catch (error) {
            console.error('❌ Error en serverSaveGame:', error);
            throw error;
        }
    }

    loadGames() {
        try {
            if (!this.currentUser) return [];

            const savedGamesJSON = localStorage.getItem('pollution_saved_games');
            if (!savedGamesJSON) return [];

            const savedGames = JSON.parse(savedGamesJSON);
            return savedGames[this.currentUser.id] || [];

        } catch (error) {
            console.error('❌ Error al cargar partidas:', error);
            return [];
        }
    }

    deleteGame(gameId) {
        try {
            if (!this.currentUser) return false;

            const savedGamesJSON = localStorage.getItem('pollution_saved_games');
            if (!savedGamesJSON) return false;

            const savedGames = JSON.parse(savedGamesJSON);
            const userGames = savedGames[this.currentUser.id] || [];

            savedGames[this.currentUser.id] = userGames.filter(game => game.id !== gameId);
            localStorage.setItem('pollution_saved_games', JSON.stringify(savedGames));

            return true;

        } catch (error) {
            console.error('❌ Error al eliminar partida:', error);
            return false;
        }
    }

    // 🎮 Modo invitado
    startAsGuest() {
        console.log('🎮 Activando modo invitado...');
        
        this.currentUser = {
            id: 'guest_' + Date.now(),
            nombre: 'Invitado',
            email: 'guest@pollution.com',
            isGuest: true
        };
        
        this.useLocalStorage = true;
        this.saveToLocalStorage();
        this.updateUI();
        
        if (window.mascotaHabla) {
            window.mascotaHabla("¡Hola Invitado! 🎮 Bienvenido al modo de prueba. Tu progreso se guardará localmente.");
        }
        
        // Actualizar saludo en la página principal
        if (window.actualizarSaludoUsuario) {
            window.actualizarSaludoUsuario();
        }
    }

    // 📊 Estadísticas del usuario
    saveStats(stats) {
        try {
            if (!this.currentUser || this.currentUser.isGuest) return;

            const userStatsJSON = localStorage.getItem('pollution_user_stats');
            const userStats = userStatsJSON ? JSON.parse(userStatsJSON) : {};

            userStats[this.currentUser.id] = {
                ...userStats[this.currentUser.id],
                ...stats,
                lastPlayed: new Date().toISOString(),
                userName: this.currentUser.nombre
            };

            localStorage.setItem('pollution_user_stats', JSON.stringify(userStats));

        } catch (error) {
            console.error('❌ Error al guardar estadísticas:', error);
        }
    }

    getStats() {
        try {
            if (!this.currentUser) return {};

            const userStatsJSON = localStorage.getItem('pollution_user_stats');
            const userStats = userStatsJSON ? JSON.parse(userStatsJSON) : {};

            return userStats[this.currentUser.id] || {};

        } catch (error) {
            console.error('❌ Error al cargar estadísticas:', error);
            return {};
        }
    }

    // 🧹 Utilidades
    loadFromLocalStorage() {
        try {
            const savedUser = localStorage.getItem('pollution_current_user');
            if (savedUser) {
                this.currentUser = JSON.parse(savedUser);
                this.useLocalStorage = true;
                console.log('✅ Usuario cargado desde localStorage:', this.currentUser.nombre);
            }
        } catch (error) {
            console.error('❌ Error al cargar usuario desde localStorage:', error);
        }
    }

    saveToLocalStorage() {
        try {
            if (this.currentUser) {
                localStorage.setItem('pollution_current_user', JSON.stringify(this.currentUser));
            }
        } catch (error) {
            console.error('❌ Error al guardar usuario en localStorage:', error);
        }
    }

    logout() {
        const nombreUsuario = this.currentUser?.nombre;
        
        this.currentUser = null;
        this.useLocalStorage = false;
        localStorage.removeItem('pollution_current_user');
        this.updateUI();
        
        if (nombreUsuario && window.mascotaHabla) {
            window.mascotaHabla(`¡Hasta pronto ${nombreUsuario}! 🐾 Espero verte pronto.`);
        }
        
        // Actualizar saludo en la página principal
        if (window.actualizarSaludoUsuario) {
            window.actualizarSaludoUsuario();
        }
    }

    updateUI() {
        const userInfoElement = document.getElementById('userInfo');
        const userStatusElement = document.getElementById('userStatus');

        if (userInfoElement) {
            if (this.currentUser) {
                userInfoElement.innerHTML = `
                    <div class="user-display">
                        <strong>👤 ${this.currentUser.nombre}</strong>
                        ${this.currentUser.isGuest ? '<br><small>🎮 Modo Invitado</small>' : ''}
                        ${this.useLocalStorage ? '<br><small>💾 Almacenamiento local</small>' : '<br><small>🗄️ Base de datos</small>'}
                    </div>
                `;
            } else {
                userInfoElement.innerHTML = '<p>No has iniciado sesión</p>';
            }
        }

        if (userStatusElement) {
            userStatusElement.textContent = this.currentUser ? 
                `Conectado como: ${this.currentUser.nombre}` : 
                'No conectado';
        }
    }

    // 🎤 Saludos personalizados
    mostrarSaludoPersonalizado() {
        if (!this.currentUser) return;
        
        const saludos = [
            `¡Hola ${this.currentUser.nombre}! 🐱 Me da mucho gusto verte de nuevo.`,
            `¡Bienvenido de nuevo ${this.currentUser.nombre}! 🌍 Tu ciudad ecológica te extrañaba.`,
            `¡Hola ${this.currentUser.nombre}! 💚 Veo que sigues comprometido con el medio ambiente.`,
            `¡${this.currentUser.nombre}! 🎉 Qué alegría tenerte aquí otra vez.`
        ];
        
        const saludoAleatorio = saludos[Math.floor(Math.random() * saludos.length)];
        
        if (window.mascotaHabla) {
            window.mascotaHabla(saludoAleatorio);
        }
    }

    showUserStats() {
        if (!this.currentUser) {
            alert('⚠️ Por favor inicia sesión primero para ver tus estadísticas');
            return;
        }

        const stats = this.getStats();
        const metodo = this.useLocalStorage ? 'Almacenamiento Local' : 'Base de Datos';
        
        const mensaje = `📊 Estadísticas de ${this.currentUser.nombre} (${metodo}):\n\n` +
              `🏆 Nivel máximo: ${stats.maxLevel || 1}\n` +
              `🎮 Partidas jugadas: ${stats.gamesPlayed || 0}\n` +
              `🌱 Plantas construidas: ${stats.plantsBuilt || 0}\n` +
              `💰 Dinero máximo: ${stats.maxMoney || 0}\n` +
              `📅 Última partida: ${stats.lastPlayed ? new Date(stats.lastPlayed).toLocaleDateString() : 'Nunca'}`;
        
        alert(mensaje);
    }

    // 🔧 Métodos de utilidad
    getSystemInfo() {
        return {
            currentUser: this.currentUser,
            useLocalStorage: this.useLocalStorage,
            serverAvailable: this.serverAvailable,
            localStorageAvailable: this.checkLocalStorage()
        };
    }

    checkLocalStorage() {
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            return true;
        } catch (e) {
            return false;
        }
    }
}

// 🌍 Instancia global
window.userSystem = new UserSystem();

// 🔧 Funciones globales
window.showUserStats = function() { window.userSystem.showUserStats(); };
window.startAsGuest = function() { window.userSystem.startAsGuest(); };
window.logoutUser = function() { window.userSystem.logout(); };
window.getUserSystemInfo = function() { return window.userSystem.getSystemInfo(); };

console.log('✅ Sistema de usuarios Pollution completamente cargado');