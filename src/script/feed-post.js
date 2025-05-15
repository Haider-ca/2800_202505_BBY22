import { renderCard } from '../utils/renderCard.js';

export async function loadPosts({
  currentPage,
  limit,
  sortBy,
  searchQuery,
  activeFilters,
  feedCards,
  loadMore,
  setLoading,
  favoritesMode = false
}) {
  setLoading(true);
  try {
    const baseUrl = favoritesMode ? '/api/post/favorites' : '/api/post/all';
    const query = new URLSearchParams({
      page: currentPage,
      limit,
      sort: sortBy,
    });

    if (searchQuery) {
      query.append('q', searchQuery);
    }

    const res = await fetch(`${baseUrl}?${query}`, { credentials: 'include' });
    const data = await res.json();

    if (data.length === 0 && currentPage === 1) {
      loadMore.innerHTML = '<span class="text-muted">No results</span>';
      return;
    } else if (data.length === 0) {
      loadMore.innerHTML = '<span class="text-muted">No more posts</span>';
      return;
    }

    data.forEach(post => {
      const voteKey = `vote_${post._id}`;
      const card = renderCard(post, voteKey, 'post');
      feedCards.appendChild(card);
    });

    currentPage++;
  } catch (err) {
    console.error('Failed to fetch Posts:', err);
  } finally {
    setLoading(false);
    // currentPage++;
  }
}
