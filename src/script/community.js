let currentPage = 1;
const limit = 5;
let isLoading = false;
let activeFilters = [];
let sortBy = 'createdAt';
const container = document.querySelector('.container');
const loadMore = document.querySelector('.text-center');

// Listen for filter and sort changes
document.querySelectorAll('.form-check-input').forEach(cb => {
  cb.addEventListener('change', resetAndLoad);
});
document.querySelector('.btn-sort')?.addEventListener('click', () => {
  // Toggle sorting between "likes" and "createdAt"
  sortBy = sortBy === 'likes' ? 'createdAt' : 'likes';
  document.getElementById('sortLabel').textContent = sortBy === 'likes' ? 'Most liked' : 'Newest';
  resetAndLoad();
});

// Reset and reload posts based on new filters/sorting
function resetAndLoad() {
  currentPage = 1;
  container.querySelectorAll('.card.mb-3').forEach(card => card.remove());
  loadMore.innerHTML = '';
  activeFilters = Array.from(document.querySelectorAll('.form-check-input:checked')).map(cb => cb.id.replace('filter', '').toLowerCase());
  loadPOIs();
}

// Initial load
document.addEventListener('DOMContentLoaded', () => {
  loadPOIs();

  // Set up infinite scroll
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !isLoading) {
      loadPOIs();
    }
  }, { threshold: 1.0 });
  observer.observe(loadMore);
});

// Fetch POIs from DB
async function loadPOIs() {
  isLoading = true;
  try {
    const query = new URLSearchParams({
      page: currentPage,
      limit: limit,
      sort: sortBy,
    });
    if (activeFilters.length > 0) {
      query.append('filter', activeFilters.join(','));
    }
    if (searchQuery) {
      query.append('q', searchQuery);
    }
    const res = await fetch(`/api/community?${query}`);
    const data = await res.json();

    if (data.length === 0 && currentPage === 1) {
      loadMore.innerHTML = '<span class="text-muted">No results</span>';
      return;
    } else if (data.length === 0) {
      loadMore.innerHTML = '<span class="text-muted">No more posts</span>';
      return;
    }

    const voterId = getOrCreateVoterId();

    // Render each post card
    data.forEach(poi => {
      const voteKey = `vote_${poi._id}`;
      const votedType = localStorage.getItem(voteKey);
      const likeIconClass = votedType === 'like' ? 'bi-hand-thumbs-up-fill' : 'bi-hand-thumbs-up';
      const dislikeIconClass = votedType === 'dislike' ? 'bi-hand-thumbs-down-fill' : 'bi-hand-thumbs-down';

      const post = document.createElement('div');
      post.className = 'card mb-3';
      post.innerHTML = `
        <div class="card-body">
          <div class="d-flex align-items-center mb-2">
            <div class="avatar me-2"></div>
            <div>
              <h6 class="mb-0">${poi.username || 'Anonymous'}</h6>
              <small class="text-muted">${formatDate(poi.createdAt)}</small>
            </div>
          </div>
          <img src="${poi.imageUrl}" class="card-img-top mb-2" alt="POI Image">
          <p>${poi.description}</p>
          <div class="d-flex justify-content-start gap-4 post-actions">
            <span class="like-btn" data-id="${poi._id}">
              <i class="bi ${likeIconClass}"></i> <span class="count">${poi.likes || 0}</span>
            </span>
            <span class="dislike-btn" data-id="${poi._id}">
              <i class="bi ${dislikeIconClass}"></i> <span class="count">${poi.dislikes || 0}</span>
            </span>
            <span class="d-none">
              <i class="bi bi-chat-dots"></i> ${poi.comments?.length || 0}
            </span>
          </div>
        </div>
      `;
      container.insertBefore(post, loadMore);
    });

    currentPage++;
  } catch (err) {
    console.error('Failed to fetch POIs:', err);
  } finally {
    isLoading = false;
  }
}

// Format date for display
function formatDate(dateString) {
  const d = new Date(dateString);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Get or generate a unique voter ID for anonymous voting
function getOrCreateVoterId() {
  let id = localStorage.getItem('voterId');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('voterId', id);
  }
  return id;
}

// Handle click events for like/dislike buttons
document.addEventListener('click', async (e) => {
  const likeBtn = e.target.closest('.like-btn');
  const dislikeBtn = e.target.closest('.dislike-btn');
  if (!likeBtn && !dislikeBtn) return;

  const isLike = !!likeBtn;
  const btn = isLike ? likeBtn : dislikeBtn;
  const otherBtn = isLike
    ? btn.parentElement.querySelector('.dislike-btn')
    : btn.parentElement.querySelector('.like-btn');

  const postId = btn.dataset.id;
  const voterId = getOrCreateVoterId();

  try {
    const res = await fetch(`/api/vote/${postId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: isLike ? 'like' : 'dislike', voterId })
    });

    const result = await res.json();
    if (res.ok) {
      // Update like/dislike count and icons
      const countSpan = btn.querySelector('.count');
      const otherCountSpan = otherBtn?.querySelector('.count');
      const icon = btn.querySelector('i');
      const otherIcon = otherBtn?.querySelector('i');
      const voteKey = `vote_${postId}`;
      const previousVote = localStorage.getItem(voteKey);

      if (countSpan) countSpan.textContent = isLike ? result.likes : result.dislikes;
      if (otherCountSpan) otherCountSpan.textContent = isLike ? result.dislikes : result.likes;

      // Toggle local vote state
      if (previousVote === (isLike ? 'like' : 'dislike')) {
        if (icon) icon.className = 'bi ' + (isLike ? 'bi-hand-thumbs-up' : 'bi-hand-thumbs-down');
        localStorage.removeItem(voteKey);
      } else {
        if (icon) icon.className = 'bi ' + (isLike ? 'bi-hand-thumbs-up-fill' : 'bi-hand-thumbs-down-fill');
        if (otherIcon) {
          otherIcon.className = 'bi ' + (isLike ? 'bi-hand-thumbs-down' : 'bi-hand-thumbs-up');
        }
        localStorage.setItem(voteKey, isLike ? 'like' : 'dislike');
      }
    }
  } catch (err) {
    console.error('Vote failed:', err);
  }
});

// Debounced search input handling
let searchQuery = '';
document.querySelector('input[placeholder="Search"]')?.addEventListener('input', (e) => {
  searchQuery = e.target.value.trim();
  debounceSearch();
});

// Wait for user to stop typing before triggering search
function debounceSearch() {
  clearTimeout(window._searchTimeout);
  window._searchTimeout = setTimeout(() => {
    resetAndLoad();
  }, 300);
}
