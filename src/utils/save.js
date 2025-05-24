/**
 * save.js
 * 
 * This utility function handles save/unsave actions for posts and POIs.
 * It updates both localStorage and the backend, and conditionally removes the card from the DOM if on a favorites page.
 * 
 * Exported Function:
 * - handleSaveClick(event, type = 'post')
 * 
 * Parameters:
 * - `event`: The click event triggered by the user
 * - `type`: Either 'post' or 'poi' (used to route the backend request)
 * 
 * Behavior:
 * - Reads the target ID from the clicked button's dataset
 * - Toggles the saved state in `localStorage`
 * - Updates the button icon between filled and unfilled bookmark
 * - Sends a `POST` (save) or `DELETE` (unsave) request to `/api/save/:type/:id`
 * - If on `?mode=favorites` page and the user unsaves an item, it removes the card from the DOM
 * 
 * Used in:
 * - Feed pages for toggling save state
 * - Favorites view for removing unsaved items immediately
 */

export function handleSaveClick(e, type = 'post') {
  const btn = e.target.closest('.save-btn');
  const postId = btn.dataset.id;
  const key = `saved-${postId}`;
  const saved = localStorage.getItem(key) === 'true';
  const icon = btn.querySelector('i');

  localStorage.setItem(key, !saved);
  icon.className = `bi ${!saved ? 'bi-bookmark-fill text-primary' : 'bi-bookmark'}`;

  // request
  fetch(`/api/save/${type}/${postId}`, {
    method: saved ? 'DELETE' : 'POST'
  }).catch(err => {
    console.error('Failed to update save state:', err);
  });

  // If unsaved request from My Favorites, remove the card
  const params = new URLSearchParams(window.location.search);
  const isFavoritesPage = params.get('mode') === 'favorites';
  if (isFavoritesPage && saved) {
    const card = btn.closest('.card');
    if (card) card.remove();
  }
}