import { loadPOIs } from './feed-poi.js';
import { loadPosts } from './feed-post.js';
import { loadAnnouncements } from './feed-announcement.js';
import { handleVoteClick } from '../utils/vote.js';
import { handleSaveClick } from '../utils/save.js';
import { loadRoutes } from './feed-routes.js';
import { requireLogin } from '../utils/authCheck.js';

let currentPage = 1;
const limit = 5;
let isLoading = false;
let activeFilters = [];
let sortBy = 'createdAt';
let sortDirection = -1;
const feedCards = document.getElementById('feed-cards');
const loadMore = document.querySelector('.text-center');
let noMoreData = false; 
let observer; 

const tabSets = {
  community: [
    { id: 'post', label: 'Community', type: 'post' },
    { id: 'poi', label: 'Places', type: 'poi' },
    { id: 'announcement', label: 'Announcements', type: 'announcement' }
  ],
  favorites: [
    { id: 'routes', label: 'Routes', type: 'routes' },
    { id: 'poi', label: 'Places', type: 'poi' },
    { id: 'post', label: 'Community', type: 'post' },
  ]
};

// Get feed type from URL
const params = new URLSearchParams(window.location.search);
const mode = params.get('mode') || 'community';
const currentTabSet = tabSets[mode] || tabSets['community'];
let feedType = currentTabSet[0].type;
const tabGroup = document.getElementById('tab-group');
function renderTabs() {
  tabGroup.innerHTML = '';
  currentTabSet.forEach((tab, index) => {
    const li = document.createElement('li');
    li.className = 'nav-item';
    li.innerHTML = `
      <button class="nav-link ${index === 0 ? 'active' : ''}" data-type="${tab.type}">
        ${tab.label}
      </button>
    `;
    tabGroup.appendChild(li);
  });
}

function updateFilterVisibility() {
  const filterBox = document.getElementById('filterBox');
  const filterBtn = document.querySelector('button[data-bs-target="#filterBox"]');

  const shouldShow = feedType === 'poi';
  if (filterBox) filterBox.classList.toggle('d-none', !shouldShow);
  if (filterBtn) filterBtn.classList.toggle('d-none', !shouldShow);
}

function updatePostButtonVisibility() {
  const createPostBtn = document.getElementById('createPostBtn');
  const shouldShow = (feedType === 'post' && mode === 'community');
  if (createPostBtn) {
    createPostBtn.classList.toggle('d-none', !shouldShow);
  }
}

// Listen for filter and sort changes
document.querySelectorAll('.form-check-input').forEach(cb => {
  cb.addEventListener('change', resetAndLoad);
});

document.querySelector('.btn-sort')?.addEventListener('click', () => {
  if (feedType === 'routes') {
    // only toggle sort direction (ascending/descending by time)
    sortDirection = sortDirection === -1 ? 1 : -1;
    document.getElementById('sortLabel').textContent =
      sortDirection === -1 ? 'Newest' : 'Oldest';
  } else {
    // toggle between 'likes' and 'createdAt' (default descending)
    sortBy = sortBy === 'likes' ? 'createdAt' : 'likes';
    document.getElementById('sortLabel').textContent =
      sortBy === 'likes' ? 'Most liked' : 'Newest';
    sortDirection = -1; // Default to descending
  }

  resetAndLoad();
});


// Reset and reload posts based on new filters/sorting
function resetAndLoad() {
  currentPage = 1;
  noMoreData = false;
  isLoading = false;
  feedCards.innerHTML = '';
  loadMore.innerHTML = '';
  activeFilters = Array.from(document.querySelectorAll('.form-check-input:checked')).map(cb => cb.id.replace('filter', '').toLowerCase());
  
  observer?.observe(loadMore);
  loadFeed();
}

// Initial load
document.addEventListener('DOMContentLoaded', () => {
  updateFilterVisibility(); // Filter feature only available for POI
  updatePostButtonVisibility(); // Create post button is only available for Comunity post
  renderTabs();
  loadFeed();

  const createPostBtn = document.getElementById('createPostBtn');
  if (createPostBtn) {
    createPostBtn.addEventListener('click', async () => {
      const loggedIn = await requireLogin();
      if (!loggedIn) return;

      window.location.href = '/html/post.html';
    });
  }

  // Set up infinite scroll
  observer = new IntersectionObserver((entries) => {
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
  if (noMoreData) return;

  const favoritesMode = mode === 'favorites';
  switch (feedType) {
    case 'post':
      loadPosts({ currentPage, 
        limit, 
        sortBy, 
        searchQuery, 
        activeFilters, 
        feedCards, 
        loadMore, 
        setLoading, 
        favoritesMode})
        .then(nextPage => {
          if (nextPage) {
            currentPage = nextPage;
          } else {
            noMoreData = true;
            observer?.unobserve(loadMore);
          }
        });
      break;
    case 'announcement':
      loadAnnouncements({ currentPage, limit, feedCards, loadMore, setLoading }).then(nextPage => {
          if (nextPage) {
            currentPage = nextPage;
          } else {
            noMoreData = true;
            observer?.unobserve(loadMore);
          }
      });
      break;
    case 'poi':
      loadPOIs({
        currentPage,
        limit,
        sortBy,
        searchQuery,
        activeFilters,
        feedCards,
        loadMore,
        setLoading,
        favoritesMode
      }).then(nextPage => {
          if (nextPage) {
            currentPage = nextPage;
          } else {
            noMoreData = true;
            observer?.unobserve(loadMore);
          }
        });
        break;
    case 'routes':
      loadRoutes({
        currentPage,
        limit,
        feedCards,
        loadMore,
        setLoading,
        sortBy: 'createdAt', // using 'createdAt' as default sort field
        sortDirection, // Sort order: -1 = newest first, 1 = oldest first
        searchQuery,
        favoritesMode: true
      }).then(nextPage => {
        if (nextPage) {
          currentPage = nextPage;
        } else {
          noMoreData = true;
          observer?.unobserve(loadMore);
        }
      });
      break;
  }
}

// Handle click events for like/dislike and saved buttons
document.addEventListener('click', async (e) => {
  // Tab toggle
  const tab = e.target.closest('#tab-group .nav-link');
  if (tab) {
    const newType = tab.getAttribute('data-type');
    if (feedType !== newType) {
      document.querySelectorAll('#tab-group .nav-link').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      feedType = newType;
      resetUIState(); //Reset search,filter and sort button
      updateFilterVisibility(); // Filter feature only available for POI
      updatePostButtonVisibility(); // Create post button lonly available for Community post
      resetAndLoad();
      return;
    }
  }

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

function resetUIState() {
  // Reset search input
  const searchInput = document.querySelector('input[placeholder="Search"]');
  if (searchInput) {
    searchInput.value = '';
    searchQuery = '';
  }

  // Reset filters
  document.querySelectorAll('.form-check-input:checked').forEach(cb => {
    cb.checked = false;
  });
  activeFilters = [];

  // Reset sort
  sortBy = 'createdAt';
  const sortLabel = document.getElementById('sortLabel');
  if (sortLabel) {
    sortLabel.textContent = 'Newest';
  }
}