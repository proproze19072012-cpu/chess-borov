// Регистрация
(function() {
    // Проверка сложности пароля
    function checkPasswordStrength(password) {
        let strength = 0;
        
        if (password.length >= 6) strength += 1;
        if (password.length >= 8) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (/[^A-Za-z0-9]/.test(password)) strength += 1;
        
        return strength;
    }

    // Показать сложность пароля
    function updatePasswordStrength(password) {
        let strengthEl = document.getElementById('passwordStrength');
        if (!strengthEl) return;
        
        let strength = checkPasswordStrength(password);
        
        strengthEl.className = 'password-strength';
        
        if (password.length === 0) {
            strengthEl.style.width = '0';
        } else if (strength <= 2) {
            strengthEl.classList.add('strength-weak');
        } else if (strength <= 3) {
            strengthEl.classList.add('strength-medium');
        } else {
            strengthEl.classList.add('strength-strong');
        }
    }

    // Валидация email
    function validateEmail(email) {
        let re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Сохранить пользователя
    function saveUser(username, email, password) {
        let users = JSON.parse(localStorage.getItem('chessUsers') || '[]');
        
        // Проверка на существование
        let exists = users.some(u => u.username === username || u.email === email);
        if (exists) return false;
        
        users.push({
            username: username,
            email: email,
            password: password,
            registered: new Date().toISOString()
        });
        
        localStorage.setItem('chessUsers', JSON.stringify(users));
        return true;
    }

    // Очистить ошибки
    function clearErrors() {
        document.querySelectorAll('.error-message').forEach(el => {
            el.style.display = 'none';
            el.textContent = '';
        });
        document.getElementById('successMessage').style.display = 'none';
    }

    // Показать ошибку
    function showError(id, message) {
        let el = document.getElementById(id);
        if (el) {
            el.textContent = message;
            el.style.display = 'block';
        }
    }

    // Регистрация
    function register() {
        clearErrors();
        
        let username = document.getElementById('username').value.trim();
        let email = document.getElementById('email').value.trim();
        let password = document.getElementById('password').value;
        let confirm = document.getElementById('confirmPassword').value;
        
        let hasError = false;
        
        // Проверка имени
        if (username.length < 3) {
            showError('usernameError', 'Имя должно быть не менее 3 символов');
            hasError = true;
        }
        
        // Проверка email
        if (!validateEmail(email)) {
            showError('emailError', 'Введите корректный email');
            hasError = true;
        }
        
        // Проверка пароля
        if (password.length < 6) {
            showError('passwordError', 'Пароль должен быть не менее 6 символов');
            hasError = true;
        }
        
        // Проверка подтверждения
        if (password !== confirm) {
            showError('confirmError', 'Пароли не совпадают');
            hasError = true;
        }
        
        if (hasError) return;
        
        // Сохраняем
        if (saveUser(username, email, password)) {
            document.getElementById('successMessage').textContent = 'Регистрация успешна! Перенаправление...';
            document.getElementById('successMessage').style.display = 'block';
            
            // Сохраняем текущего пользователя
            localStorage.setItem('chessCurrentUser', username);
            
            // Перенаправление
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        } else {
            showError('usernameError', 'Пользователь с таким именем или email уже существует');
        }
    }

    // Загрузка
    document.addEventListener('DOMContentLoaded', function() {
        let passwordInput = document.getElementById('password');
        if (passwordInput) {
            passwordInput.addEventListener('input', function() {
                updatePasswordStrength(this.value);
            });
        }
        
        let form = document.getElementById('registerForm');
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                register();
            });
        }
        
        let registerBtn = document.getElementById('registerBtn');
        if (registerBtn) {
            registerBtn.addEventListener('click', register);
        }
    });
})();