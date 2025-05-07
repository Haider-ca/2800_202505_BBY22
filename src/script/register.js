document.getElementById('register-form').addEventListener('submit', async function (e) {
          e.preventDefault(); // Prevent form's default behavior
        
          // Get values from form
          const name = document.getElementById('name').value.trim();
          const email = document.getElementById('email').value.trim();
          const password = document.getElementById('password').value;
          const confirmPassword = document.getElementById('confirm-password').value;
        
          // Basic validation
          if (password !== confirmPassword) {
            return alert('Passwords do not match');
          }
        
          try {
            const response = await fetch('/api/register', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password })  // 'name' is collected but not used in backend yet
            });
        
            const data = await response.json();
        
            if (response.ok) {
              alert('Registration successful!');
              window.location.href = '../login/login.html';
            } else {
              alert(data.message || 'Registration failed');
            }
          } catch (err) {
            console.error('Registration error:', err);
            alert('Something went wrong. Please try again.');
          }
        });
        