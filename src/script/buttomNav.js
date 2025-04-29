// // project/src/script/bottomNav.js
// document.addEventListener('DOMContentLoaded', () => {
//     const placeholder = document.getElementById('bottom-navbar-placeholder');
//     if (!placeholder) return;
  
//     // compute directory of current page, e.g. "/html"
//     const path = window.location.pathname;                     
//     const dir  = path.substring(0, path.lastIndexOf('/'));   
  
//     // fetch bottomNavbar.html from /html/partials/
//     const url = `${dir}/partials/bottomNavbar.html`;
  
//     fetch(url)
//       .then(res => {
//         if (!res.ok) throw new Error(`Failed to load ${url}: HTTP ${res.status}`);
//         return res.text();
//       })
//       .then(html => placeholder.innerHTML = html)
//       .catch(err => console.error('Bottom navbar load error:', err));
//   });
  