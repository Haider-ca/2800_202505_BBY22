// Load navbar and bottom navbar when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const topEl = document.getElementById('navbar-placeholder');
  const botEl = document.getElementById('bottom-navbar-placeholder');

  if (topEl) {
    // ✅ Dynamically check login status instead of relying on data-nav
    fetch('/api/check-auth', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        const frag = data.loggedIn ? 'navbarAfterLogin' : 'navbarBeforeLogin';

        // ✅ Load the correct navbar based on login status
        fetch(`/partials/${frag}.html`)
          .then(r => r.ok ? r.text() : Promise.reject(r.statusText))
          .then(html => {
            topEl.innerHTML = html;

            if (data.loggedIn) {
              // ✅ Personalize navbar if user is logged in
              const nameSpan = document.getElementById('user-name');
              const homeLink = document.querySelector('.nav-link[href="/index.html"]');
              if (nameSpan) {
                nameSpan.innerHTML = `Hi, ${data.name}`;
              }
              if (homeLink) {
                homeLink.setAttribute('href', '/html/home.html');
              }

              // ✅ Bind logout button event
              bindLogout();
            }
          });
      });
  }

  if (botEl) {
    // ✅ Load bottom navbar if present
    fetch(`/partials/bottomNavbar.html`)
      .then(r => r.ok ? r.text() : Promise.reject(r.statusText))
      .then(html => botEl.innerHTML = html);
  }

  // ✅ Listen for logout events triggered from other tabs
  window.addEventListener('storage', (e) => {
    if (e.key === 'logout-event') {
      location.reload(); // Reload to update navbar after logout
    }
  });
});

// ✅ Bind logout functionality after navbar is loaded
function bindLogout() {
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        const res = await fetch('/api/logout', {
          method: 'POST',
          credentials: 'include'
        });

        if (res.ok) {
          // ✅ Notify other tabs that logout occurred
          localStorage.setItem('logout-event', Date.now());

          // ✅ Load the "before login" navbar after logout
          fetch('/partials/navbarBeforeLogin.html')
            .then(r => r.ok ? r.text() : Promise.reject(r.statusText))
            .then(html => {
              document.getElementById('navbar-placeholder').innerHTML = html;
            });

          // ✅ Optional: Redirect to home page
          // window.location.href = '/index.html';
        } else {
          alert('Logout failed.');
        }
      } catch (err) {
        console.error('Logout error:', err);
      }
    });
  } else {
    console.warn('Logout button not found.');
  }
}

