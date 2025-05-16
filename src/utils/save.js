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