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

              //✅ set up contact us pop up window
              setupContactUsPopup();

              //✅ set up new message notification
               setupMessageMenuClick()

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
              window.location.href = '/index.html';
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


//Set up the pop up window for contact us function
function setupContactUsPopup() {
  const existingPopup = document.getElementById('contact-popup');
    if (existingPopup) {
        existingPopup.remove();
      }

  const contactBtn = document.getElementById('contact-us');
  if (!contactBtn) return;

  contactBtn.addEventListener('click', () => {
    const popup = document.createElement('div');
    popup.innerHTML = `
      <div id="contact-popup">
        <h5>Contact Us</h5>
        <input id="contact-title" placeholder="Title" />
        <textarea id="contact-description" placeholder="Description"></textarea>
        <div style="text-align: right; margin-top: 12px;">
          <button id="contact-cancel">Cancel</button>
          <button id="contact-submit">Submit</button>
        </div>
      </div>
    `;

    document.body.appendChild(popup);
    makePopupDraggable(document.getElementById('contact-popup'));

    document.getElementById('contact-cancel').onclick = () => popup.remove();

    document.getElementById('contact-submit').onclick = async () => {
      const title = document.getElementById('contact-title').value.trim();
      const description = document.getElementById('contact-description').value.trim();
      if (!title || !description) {
        alert('Title and Description are required.');
        return;
      }

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ title, description })
        });

        if (res.ok) {
          alert('Thank you for your feedback!');
          popup.remove();
        } else {
          alert('Submission failed. Please try again.');
        }
      } catch (err) {
        console.error('Error:', err);
        alert('Network error. Try again.');
      }
    };
  });
}

function makePopupDraggable(popup) {
  let isDragging = false;
  let offsetX, offsetY;

  const header = popup.querySelector('h5');
  header.style.cursor = 'move';

  header.addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX - popup.offsetLeft;
    offsetY = e.clientY - popup.offsetTop;
    popup.style.transition = 'none';
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      popup.style.left = `${e.clientX - offsetX}px`;
      popup.style.top = `${e.clientY - offsetY}px`;
    }
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });
}

function setupMessageMenuClick() {
  const messageMenu = document.getElementById('message-menu');
  if (!messageMenu) {
    console.warn('❌ #message-menu not found in nav');
    return;
  }

  messageMenu.addEventListener('click', (e) => {
    e.preventDefault();

    // Read target info from sessionStorage (set by notification.js)
    const type = sessionStorage.getItem('targetType');
    const id = sessionStorage.getItem('targetId');

    if (!type || !id) {
      alert('⚠️ No new message available.');
      return;
    }

    clearNotificationIndicators();

    // If already on the feed page, scroll directly
    const isOnFeedPage = window.location.pathname === '/html/feed.html';
    if (isOnFeedPage) {
      window.switchToTabByType?.(type);
      window.resetAndLoad?.();
      setTimeout(() => {
        window.scrollToLatestTarget?.();
      }, 600);
    } else {
      // Otherwise, go to feed page and scroll from there
      window.location.href = '/html/feed.html';
    }
  });
}
