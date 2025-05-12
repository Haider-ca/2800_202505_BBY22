// Load navbar on page ready
document.addEventListener('DOMContentLoaded', () => {
  const topEl = document.getElementById('navbar-placeholder');
  const botEl = document.getElementById('bottom-navbar-placeholder');

  if (topEl) {
    const frag = topEl.dataset.nav === 'after' ? 'navbarAfterLogin' : 'navbarBeforeLogin';

    fetch(`/partials/${frag}.html`)
      .then(r => r.ok ? r.text() : Promise.reject(r.statusText))
      .then(html => {
        topEl.innerHTML = html;

        // ✅ Inserted -> Now bind logout
        bindLogout();

        // ✅ Then fetch login info
        fetch('/api/check-auth', { credentials: 'include' })
          .then(res => res.json())
          .then(data => {
            if (data.loggedIn) {
              const nameSpan = document.getElementById('user-name');
              if (nameSpan) {
                nameSpan.innerHTML = `Hi, ${data.name}`;
              }
            }
          });
      });
  }

  if (botEl) {
    fetch(`/partials/bottomNavbar.html`)
      .then(r => r.ok ? r.text() : Promise.reject(r.statusText))
      .then(html => botEl.innerHTML = html);
  }
});

// ✅ Bind logout functionality AFTER navbar is inserted
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
          // Replace with logged-out navbar
          fetch('/partials/navbarBeforeLogin.html')
            .then(r => r.ok ? r.text() : Promise.reject(r.statusText))
            .then(html => {
              document.getElementById('navbar-placeholder').innerHTML = html;
            });
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
