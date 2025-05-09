//src/script/login.js
document.getElementById('login-form').addEventListener('submit', async function (e) {
          e.preventDefault(); // Prevent the default HTML form submission
        
          // Get user input values
          const email = document.getElementById('email').value.trim();
          const password = document.getElementById('password').value;
          
        
          try {
            // Send login request to backend
            const response = await fetch('/api/login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ email, password }),
              credentials:'include'
            });
        
            const data = await response.json();
        
            if (response.ok) {
              // Login success: redirect or show message
              alert('Login successful');
              window.location.href = '/html/home.html'; // Change to your main page
            } else {
              // Show error message from backend
              alert(data.message || 'Login failed');
            }
          } catch (error) {
            console.error('Login error:', error);
            alert('Something went wrong. Please try again later.');
          }
        });
        