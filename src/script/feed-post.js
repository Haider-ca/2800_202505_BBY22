/**
 * This module handles loading general (non-POI) community posts from the backend and rendering them as cards.
 * It supports pagination, search, and can optionally load saved (favorite) posts.
 * 
 * Exported Function:
 * - loadPosts({
 *     currentPage,
 *     limit,
 *     sortBy,
 *     searchQuery,
 *     activeFilters,
 *     feedCards,
 *     loadMore,
 *     setLoading,
 *     favoritesMode = false
 *   })
 * 
 * Parameters:
 * - `currentPage`: Current page number for pagination
 * - `limit`: Number of posts to load per page
 * - `sortBy`: Sorting criteria (e.g., 'likes' or 'createdAt')
 * - `searchQuery`: Keyword for fuzzy search
 * - `activeFilters`: (Currently unused but included for consistency with POI logic)
 * - `feedCards`: DOM container where rendered post cards will be appended
 * - `loadMore`: DOM element used to show "no more results" messages
 * - `setLoading`: Function to toggle the loading indicator
 * - `favoritesMode`: If true, fetches only the user's saved posts
 * 
 * Behavior:
 * - Builds a query string based on current filters and search input
 * - Fetches post data from `/api/post/all` or `/api/post/favorites`
 * - Renders each post using `renderCard()` and appends to the feed
 * - Displays message if no results found or no more posts available
 */

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
      card.id = `post-${post._id}`;
      feedCards.appendChild(card);
    });

    if (data.length === 0 || data.length < limit) {
      loadMore.innerHTML = '<span class="text-muted">No more posts</span>';
      return null;
    }

    return currentPage + 1;
  } catch (err) {
    console.error('Failed to fetch Posts:', err);
  } finally {
    setLoading(false);
  }
}


