import { loadPOIs } from './feed-poi.js';
import { loadPosts } from './feed-post.js';
import { loadAnnouncements } from './feed-announcement.js';
import { getOrCreateVoterId } from '../utils/helpers.js';
import { handleVoteClick } from '../utils/vote.js';
import { handleSaveClick } from '../utils/save.js';

let currentPage = 1;
const limit = 5;
let isLoading = false;
let activeFilters = [];
let sortBy = 'createdAt';
const container = document.querySelector('.container');
const feedCards = document.getElementById('feed-cards');
const loadMore = document.querySelector('.text-center');
let feedType = 'poi';

// Get feed type from URL
const params = new URLSearchParams(window.location.search);
feedType = params.get('type') || 'poi';

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
  feedCards.innerHTML = '';
  loadMore.innerHTML = '';
  activeFilters = Array.from(document.querySelectorAll('.form-check-input:checked')).map(cb => cb.id.replace('filter', '').toLowerCase());
  loadFeed();
}

// Initial load
document.addEventListener('DOMContentLoaded', () => {
  loadFeed();

  // Set up infinite scroll
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !isLoading) {
      loadFeed();
    }
  }, { threshold: 0.5 });
  observer.observe(loadMore);
});

function setLoading(state) {
  isLoading = state;
  if (!state) currentPage++;
}

// Fetch data from DB
function loadFeed() {
  switch (feedType) {
    case 'post':
      loadPosts({ currentPage, limit, sortBy, searchQuery, activeFilters, container, loadMore, setLoading })
        .then(nextPage => {
          if (nextPage) currentPage = nextPage;
        });
      break;
    case 'announcement':
      loadAnnouncements({ currentPage, limit, sortBy, searchQuery, activeFilters, container, loadMore, setLoading })
        .then(nextPage => {
          if (nextPage) currentPage = nextPage;
        });
      break;
    case 'poi':
    default:
      const subtype = new URLSearchParams(window.location.search).get('sub') || 'all';
      loadPOIs({
        currentPage,
        limit,
        sortBy,
        searchQuery,
        activeFilters,
        feedCards,
        loadMore,
        setLoading,
        poiType: subtype
      })
        .then(nextPage => {
          if (nextPage) currentPage = nextPage;
        });
  }
}

// Handle click events for like/dislike buttons
document.addEventListener('click', async (e) => {
  const likeBtn = e.target.closest('.like-btn');
  const dislikeBtn = e.target.closest('.dislike-btn');
  const saveBtn = e.target.closest('.save-btn');

  if (likeBtn || dislikeBtn) {
    const btn = likeBtn || dislikeBtn;
    const type = btn.dataset.type || 'post';
    await handleVoteClick(e, type);
    return;
  }

  if (saveBtn) {
    const type = saveBtn.dataset.type || 'post';
    handleSaveClick(e, type);
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
