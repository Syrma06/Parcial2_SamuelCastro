document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const messageDiv = document.getElementById('message');

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Validaciones
        if (password !== confirmPassword) {
            showMessage('Las contraseñas no coinciden', 'danger');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                showMessage('Registro exitoso. Redirigiendo...', 'success');
                setTimeout(() => window.location.href = 'login.html', 2000);
            } else {
                showMessage(data.error || 'Error en el registro', 'danger');
            }
        } catch (error) {
            showMessage('Error de conexión', 'danger');
        }
    });

    function showMessage(text, type) {
        messageDiv.textContent = text;
        messageDiv.className = `alert alert-${type} d-block`;
        setTimeout(() => messageDiv.className = 'alert d-none', 3000);
    }
});