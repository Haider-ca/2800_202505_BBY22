export async function requireLogin(redirectUrl = '/login/login.html') {
    try {
      const res = await fetch('/api/check-auth', { credentials: 'include' });
      const data = await res.json();
  
      if (!data.loggedIn) {
        alert('You must be logged in.');
        window.location.href = redirectUrl;
        return false;
      }
      return true;
    } catch (err) {
      console.error('Login check failed:', err);
      window.location.href = redirectUrl;
      return false;
    }
  }
  