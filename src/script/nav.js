// src/script/nav.js
// NAV MODULE — DO NOT MODIFY

document.addEventListener('DOMContentLoaded', async () => {
  const navContainer    = document.getElementById('navbar-placeholder');
  const bottomContainer = document.getElementById('bottom-navbar-placeholder');
  if (!navContainer || !bottomContainer) return;

  try {
    // Load top nav (before-login by default)
    const beforeHtml = await fetch('/partials/navbarBeforeLogin.html').then(r => r.text());
    navContainer.innerHTML = beforeHtml;

    // If you implement login-state detection in the future,
    // swap out the above for navbarAfterLogin.html.
    //
    // e.g.:
    // const isLoggedIn = /* your auth check */;
    // const topFile    = isLoggedIn
    //   ? '/partials/navbarAfterLogin.html'
    //   : '/partials/navbarBeforeLogin.html';
    // const topHtml    = await fetch(topFile).then(r => r.text());
    // navContainer.innerHTML = topHtml;

    // Load bottom nav
    const bottomHtml = await fetch('/partials/bottomNavbar.html').then(r => r.text());
    bottomContainer.innerHTML = bottomHtml;
  } catch (err) {
    console.error('Failed to load nav partials:', err);
  }
});
