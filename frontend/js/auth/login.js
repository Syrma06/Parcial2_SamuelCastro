document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const messageDiv = document.getElementById('message');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Validación básica
        if (!email || !password) {
            showMessage('Todos los campos son obligatorios', 'danger');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Guardar token y redirigir
                sessionStorage.setItem('authToken', data.token);
                window.location.href = 'index.html';
            } else {
                showMessage(data.error || 'Error en el login', 'danger');
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