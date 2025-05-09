document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  const dir = path.substring(0, path.lastIndexOf('/'));

  const topEl = document.getElementById('navbar-placeholder');
  const botEl = document.getElementById('bottom-navbar-placeholder');

  if (topEl) {
    const frag = topEl.dataset.nav === 'after'
      ? 'navbarAfterLogin'
      : 'navbarBeforeLogin';

    fetch(`/partials/${frag}.html`)
      .then(r => r.ok ? r.text() : Promise.reject(r.statusText))
      .then(html => {
        topEl.innerHTML = html;

        // ✅ Only after navbar is loaded, do check-auth and modify DOM
        fetch('/api/check-auth', { credentials: 'include' })
          .then(res => res.json())
          .then(data => {
            if (data.loggedIn) {
              const homeLink = document.querySelector('.nav-link[href="/index.html"]');
              if (homeLink) {
                homeLink.setAttribute('href', '/html/home.html');
              }

              const nameSpan = document.getElementById('user-name');
              if (nameSpan && data.name) {
                nameSpan.innerHTML = `Hi, ${data.name}`;
              }
            }
          })
          .catch(err => {
            console.error('Login check failed:', err);
          });
      })
      .catch(err => console.error('Top navbar load error:', err));
  }

  if (botEl) {
    fetch(`/partials/bottomNavbar.html`)
      .then(r => r.ok ? r.text() : Promise.reject(r.statusText))
      .then(html => botEl.innerHTML = html)
      .catch(err => console.error('Bottom navbar load error:', err));
  }
});
