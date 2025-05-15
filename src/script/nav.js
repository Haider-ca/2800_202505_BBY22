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
              if (nameSpan) {
                nameSpan.innerHTML = `Hi, ${data.name}`;
              }

              // ✅ Bind logout button event
              bindLogout();

              // ✅ Bind theme switch button event
              bindThemeSwitcher(); 

              //✅ adjust text size
              bindSizeSwitcher(); 

              if (botEl) {
                 // ✅ Load bottom navbar if present
                    fetch(`/partials/bottomNavbar.html`)
                   .then(r => r.ok ? r.text() : Promise.reject(r.statusText))
                   .then(bottomHtml => {
                    botEl.innerHTML = bottomHtml;
                    const homeLink = botEl.querySelector('#home-link');
                    if (homeLink) {
                      homeLink.setAttribute('href', data.loggedIn ? '/html/feed.html?mode=community' : '/html/home.html');
                    }
                   });
               }
            }
            else{
              const homeLink = botEl.querySelector('#home-link');
              homeLink.setAttribute('href', '/html/home.html');
            }
          });
      });
  }
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
              window.location.href = '/html/home.html';
            });

         window.location.href = '/index.html';


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

function bindSizeSwitcher() {
  const sizeBtn = document.getElementById('size-btn');
  const body = document.body;
  const sizes = ['size-small', 'size-medium', 'size-large'];
  const labels = ['Small', 'Medium', 'Large'];
  let currentSizeIndex = 1; // Default is medium

  const savedSize = localStorage.getItem('fontSizeClass');
  if (savedSize && sizes.includes(savedSize)) {
    body.classList.add(savedSize);
    currentSizeIndex = sizes.indexOf(savedSize);
  } else {
    body.classList.add(sizes[currentSizeIndex]);
  }

  // Update button label initially
  if (sizeBtn) {
    sizeBtn.textContent = `Text Size: ${labels[currentSizeIndex]}`;

    sizeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      body.classList.remove(sizes[currentSizeIndex]);
      currentSizeIndex = (currentSizeIndex + 1) % sizes.length;
      body.classList.add(sizes[currentSizeIndex]);
      localStorage.setItem('fontSizeClass', sizes[currentSizeIndex]);

      // Update button label after change
      sizeBtn.textContent = `Size: ${labels[currentSizeIndex]}`;
    });
  }
}
