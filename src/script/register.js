import { showToast } from '../utils/toast.js';
document.getElementById('register-form').addEventListener('submit', async function (e) {
          e.preventDefault(); // Prevent form's default behavior
        
          // Get values from form
          const name = document.getElementById('name').value.trim();
          const email = document.getElementById('email').value.trim();
          const password = document.getElementById('password').value;
          const confirmPassword = document.getElementById('confirm-password').value;
        
          // Basic validation
          if (password !== confirmPassword) {
            return showToast('Passwords do not match', 'error');
          }
        
          try {
            const response = await fetch('/api/register', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name, email, password }) 
            });
        
            const data = await response.json();
        
            if (response.ok) {
              showToast('Registration successful!', 'success');
              await new Promise(resolve => setTimeout(resolve, 1000));
              window.location.href = '../login/login.html';
            } else {
              showToast(data.message || 'Registration failed', 'error');
            }
          } catch (err) {
            console.error('Registration error:', err);
            showToast('Something went wrong. Please try again.', 'error');
          }
        });
        