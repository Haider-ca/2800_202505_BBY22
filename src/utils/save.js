export function handleSaveClick(e, type = 'post') {
    const btn = e.target.closest('.save-btn');
    const postId = btn.dataset.id;
    const key = `saved-${postId}`;
    const saved = localStorage.getItem(key) === 'true';
  
    localStorage.setItem(key, !saved);
    const icon = btn.querySelector('i');
    icon.className = `bi ${!saved ? 'bi-bookmark-fill text-primary' : 'bi-bookmark'}`;
  
    fetch(`/api/save/${type}/${postId}`, {
      method: 'POST'
    }).catch(err => {
      console.error('Failed to save:', err);
    });
  }
  