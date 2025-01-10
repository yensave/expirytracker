document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registerForm');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    const modal = document.getElementById('termsModal');
    const termsLink = document.getElementById('termsLink');
    const privacyLink = document.getElementById('privacyLink');
    const closeBtn = document.querySelector('.close');
    
    // Password toggle functionality
    const passwordToggles = document.querySelectorAll('.password-toggle');
    
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            const input = this.parentElement.querySelector('input');
            const icon = this.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            }
        });
    });

    // Password strength checker
    password.addEventListener('input', function() {
        const strength = checkPasswordStrength(this.value);
        updatePasswordStrength(strength);
    });

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const fullName = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;
        const terms = document.getElementById('terms').checked;
        
        removeError();

        if (!fullName || !email || !password.value) {
            showError('Please fill in all fields');
            return;
        }

        if (!isValidEmail(email)) {
            showError('Please enter a valid email address');
            return;
        }

        if (password.value.length < 8) {
            showError('Password must be at least 8 characters long');
            return;
        }

        if (password.value !== confirmPassword.value) {
            showError('Passwords do not match');
            return;
        }

        if (!terms) {
            showError('Please accept the Terms and Privacy Policy');
            return;
        }

        const button = form.querySelector('button[type="submit"]');
        button.innerHTML = '<span class="spinner"></span> Creating Account...';
        button.disabled = true;

        try {
            let users = JSON.parse(localStorage.getItem('users') || '[]');
            
            if (users.some(user => user.email === email)) {
                showError('An account with this email already exists');
                button.innerHTML = 'Create Account';
                button.disabled = false;
                return;
            }

            users.push({
                fullName,
                email,
                password: password.value
            });

            localStorage.setItem('users', JSON.stringify(users));
            
            button.innerHTML = '✓ Account Created!';
            button.classList.add('success');
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);

        } catch (error) {
            showError('Registration failed. Please try again.');
            button.innerHTML = 'Create Account';
            button.disabled = false;
        }
    });

    function checkPasswordStrength(password) {
        if (password.length < 8) return 'weak';
        
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        
        const strength = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChars]
            .filter(Boolean).length;
        
        if (strength < 3) return 'weak';
        if (strength === 3) return 'medium';
        return 'strong';
    }

    function updatePasswordStrength(strength) {
        const strengthBar = document.querySelector('.password-strength div');
        strengthBar.className = `strength-${strength}`;
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function showError(message) {
        removeError();
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message animate__animated animate__shakeX';
        errorDiv.textContent = message;
        
        form.insertBefore(errorDiv, form.firstChild);
    }

    function removeError() {
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
    }

    // Modal functionality
    termsLink.onclick = function(e) {
        e.preventDefault();
        modal.style.display = "block";
    }

    privacyLink.onclick = function(e) {
        e.preventDefault();
        modal.style.display = "block";
    }

    closeBtn.onclick = function() {
        modal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    // Add notification functionality
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
});
