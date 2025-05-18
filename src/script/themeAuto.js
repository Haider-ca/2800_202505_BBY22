// src/script/themeAuto.js
(function(){
  // Update <html data-theme> if the user has chosen "system"
  function updateSystemTheme() {
    const theme  = localStorage.getItem('theme') || 'system';
    if (theme !== 'system') return;      // only care about "system"
    const dark   = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const html   = document.documentElement;
    const current = html.getAttribute('data-theme');
    const next    = dark ? 'dark' : 'light';
    if (current !== next) {
      html.setAttribute('data-theme', next);
    }
  }

  // Listen to OS changes
  const mql = window.matchMedia('(prefers-color-scheme: dark)');
  mql.addEventListener('change', updateSystemTheme);

  // Run on initial load
  document.addEventListener('DOMContentLoaded', updateSystemTheme);
})();
