document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const button = this.querySelector('button');

        removeError();

        // Basic validation
        if (!email || !password) {
            showError('Please fill in all fields');
            return;
        }

        // Email format validation
        if (!isValidEmail(email)) {
            showError('Please enter a valid email address');
            return;
        }

        // Show loading state
        button.innerHTML = '<span class="spinner"></span> Logging in...';
        button.disabled = true;

        try {
            // Get users from localStorage
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(u => u.email === email);

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            if (!user) {
                showError('No account found with this email address');
                button.innerHTML = 'Login';
                button.disabled = false;
                return;
            }

            // Check password
            if (user.password !== password) {
                showError('Incorrect password');
                button.innerHTML = 'Login';
                button.disabled = false;
                
                // Clear password field on incorrect attempt
                document.getElementById('password').value = '';
                return;
            }

            // Success case
            button.innerHTML = '✓ Success!';
            button.classList.add('success');
            
            // Redirect after success
            setTimeout(() => {
                window.location.href = '/dashboard.html';
            }, 1000);

        } catch (error) {
            showError('Login failed. Please try again.');
            button.innerHTML = 'Login';
            button.disabled = false;
        }
    });

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function showError(message) {
        removeError();
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message animate__animated animate__shakeX';
        errorDiv.textContent = message;
        
        loginForm.insertBefore(errorDiv, loginForm.firstChild);
    }

    function removeError() {
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
    }

    // Password toggle functionality
    const passwordToggles = document.querySelectorAll('.password-toggle');
    
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            const input = this.parentElement.querySelector('input');
            
            // Toggle password visibility
            if (input.type === 'password') {
                input.type = 'text';  // Show password
                this.classList.add('password-visible');
            } else {
                input.type = 'password';  // Hide password
                this.classList.remove('password-visible');
            }
        });
    });

    document.querySelector('a[href="register.html"]').addEventListener('click', function(e) {
        console.log('Link clicked');
        // Uncomment the next line to force navigation
        // window.location.href = 'register.html';
    });
});