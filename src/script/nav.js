// loads top and bottom navbar fragments
document.addEventListener('DOMContentLoaded', () => {
  // derive the folder your HTML lives in (/html)
  const path = window.location.pathname;                      
  const dir  = path.substring(0, path.lastIndexOf('/'));      

  // 1️⃣ Top navbar
  const topEl = document.getElementById('navbar-placeholder');
  if (topEl) {
    const frag = topEl.dataset.nav === 'after'
      ? 'navbarAfterLogin'
      : 'navbarBeforeLogin';
    fetch(`${dir}/partials/${frag}.html`)
      .then(r => r.ok ? r.text() : Promise.reject(r.statusText))
      .then(html => topEl.innerHTML = html)
      .catch(err => console.error('Top navbar load error:', err));
  }

  // 2️⃣ Bottom navbar
  const botEl = document.getElementById('bottom-navbar-placeholder');
  if (botEl) {
    fetch(`${dir}/partials/bottomNavbar.html`)
      .then(r => r.ok ? r.text() : Promise.reject(r.statusText))
      .then(html => botEl.innerHTML = html)
      .catch(err => console.error('Bottom navbar load error:', err));
  }
});
