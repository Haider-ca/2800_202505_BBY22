// Load navbar and bottom navbar when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const topEl = document.getElementById('navbar-placeholder');
  const botEl = document.getElementById('bottom-navbar-placeholder');
  const userTheme = localStorage.getItem('theme') || 'system';
  document.documentElement.setAttribute('data-theme', userTheme);
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

              // ✅ Bind theme switch button event
              bindThemeSwitcher(); 
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
  //window.addEventListener('storage', (e) => {
  //  if (e.key === 'logout-event') {
  //    location.reload(); // Reload to update navbar after logout
  //  }
  //});
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

            location.reload();

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

function bindThemeSwitcher() {
  const themeBtn = document.getElementById('theme-btn');
  const themes = ['light', 'dark', 'system'];
  let currentTheme = localStorage.getItem('theme') || 'system';

  applyTheme(currentTheme);

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const index = themes.indexOf(currentTheme);
      currentTheme = themes[(index + 1) % themes.length];

      localStorage.setItem('theme', currentTheme);
      applyTheme(currentTheme);

      // Optional: update button label
      themeBtn.textContent = `Theme: ${capitalize(currentTheme)}`;
    });

    // Set label on first load
    themeBtn.textContent = `Theme: ${capitalize(currentTheme)}`;
  }
}

function applyTheme(theme) {
  const html = document.documentElement;
  const topNavbar = document.querySelector('#navbar-placeholder nav.navbar');
  const bottomNavbar = document.querySelector('#bottom-navbar-placeholder nav.navbar');

  if (theme === 'light') {
    html.setAttribute('data-theme', 'light');
  } else if (theme === 'dark') {
    html.setAttribute('data-theme', 'dark');
  } else {
     html.setAttribute('data-theme', 'system');
  }
}


function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}
