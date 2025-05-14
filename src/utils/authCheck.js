/**
 * requireLogin - A utility function to check user login status.
 * If the user is not logged in, it shows a toast message and redirects to the login page.
 * 
 * @param {string} redirectUrl - Optional. URL to redirect to if user is not authenticated.
 * @returns {Promise<boolean>} - Resolves to true if logged in, false otherwise.
 */

import { showToast } from './toast.js';

export async function requireLogin(redirectUrl = '/html/login/login.html') {
  try {
    const res = await fetch('/api/check-auth', { credentials: 'include' });
    const data = await res.json();
    if (!data.loggedIn) {
      showToast('You must be logged in.', 'error');
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 2000);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Login check failed:', err);
    showToast('Login check failed.','error');
    setTimeout(() => {
      window.location.href = redirectUrl;
    }, 2000);
    return false;
  }
}
