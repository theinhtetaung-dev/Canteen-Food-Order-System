document.addEventListener('DOMContentLoaded', () => {
    // If already logged in, redirect to appropriate dashboard
    const token = localStorage.getItem('jwt_token');
    const role = localStorage.getItem('user_role');
    
    if (token) {
        redirectBasedOnRole(role);
    }

    const loginForm = document.getElementById('login-form');
    const alertBox = document.getElementById('alert-box');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const usernameInput = document.getElementById('username').value;
            const passwordInput = document.getElementById('password').value;
            const submitBtn = loginForm.querySelector('button[type="submit"]');

            submitBtn.textContent = 'Signing in...';
            submitBtn.disabled = true;
            alertBox.style.display = 'none';

            try {
                const response = await api.post('/auth/login', {
                    userName: usernameInput,
                    password: passwordInput
                });

                // Save auth info
                localStorage.setItem('jwt_token', response.token);
                localStorage.setItem('user_role', response.role);
                localStorage.setItem('user_name', response.userName);

                redirectBasedOnRole(response.role);

            } catch (error) {
                alertBox.textContent = error.message || 'Login failed. Please check your credentials.';
                alertBox.className = 'alert alert-danger';
                alertBox.style.display = 'block';
            } finally {
                submitBtn.textContent = 'Sign In';
                submitBtn.disabled = false;
            }
        });
    }
});

function redirectBasedOnRole(role) {
    if (role === 'ADMIN') {
        window.location.href = 'admin.html';
    } else {
        window.location.href = 'user.html';
    }
}
