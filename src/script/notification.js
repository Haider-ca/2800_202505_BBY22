let lastChecked = new Date().toISOString();
//console.log("✅ notification.js loaded");

// Store latest notification data from backend
let latestTargetId = null;
let latestTargetType = null;

// Check user login status first
fetch('/api/check-auth', { credentials: 'include' })
  .then(res => res.json())
  .then(data => {
    //console.log('✅ check-auth result:', data);

    if (data.loggedIn) {
      setInterval(async () => {
        try {
          const res = await fetch(`/api/notifications?lastChecked=${lastChecked}`, {
            credentials: 'include'
          });
          const data = await res.json();

          if (data.hasNew) {
            console.log('🔴 New content detected!');
            showNotificationIndicators();

            // Save latest content ID and type from backend
            latestTargetId = data.latestId;
            latestTargetType = data.type; // 'post' or 'poi'
            sessionStorage.setItem('targetType', latestTargetType);
            sessionStorage.setItem('targetId', latestTargetId);
          }

          lastChecked = new Date().toISOString();
        } catch (err) {
          console.error('❌ Polling error:', err);
        }
      }, 5 * 1000);
    }
  });

// ✅ Show red dot indicators
function showNotificationIndicators() {
  document.getElementById('notification-indicator')?.style.setProperty('display', 'inline-block');
  document.getElementById('menu-indicator')?.style.setProperty('display', 'inline-block');
  document.getElementById('hamburger-indicator')?.style.setProperty('display', 'inline-block');
}



window.scrollToLatestTarget = function () {
  const type = sessionStorage.getItem('targetType');
  const id = sessionStorage.getItem('targetId');
  if (!type || !id) return;

  const targetElementId = `${type}-${id}`;
  let attempts = 0;

  const tryScroll = () => {
    const el = document.getElementById(targetElementId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      //el.classList.add('border', 'border-danger', 'border-2');
      sessionStorage.removeItem('targetType');
      sessionStorage.removeItem('targetId');
      window.clearNotificationIndicators?.();
    } else if (attempts < 10) {
      attempts++;
      setTimeout(tryScroll, 300);
    }
  };

  tryScroll();
};

// ✅ Hide red dot indicators
window.clearNotificationIndicators = function () {
  document.getElementById('notification-indicator')?.style.setProperty('display', 'none');
  document.getElementById('menu-indicator')?.style.setProperty('display', 'none');
  document.getElementById('hamburger-indicator')?.style.setProperty('display', 'none');
};



