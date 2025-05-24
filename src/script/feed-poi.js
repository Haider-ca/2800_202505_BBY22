/**
 * This module handles loading POI (Point of Interest) data from the backend and rendering them as cards.
 * It supports pagination, sorting, filtering, and search. It also adapts for both normal and favorites mode.
 * 
 * Exported Function:
 * - loadPOIs({
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
 * - `limit`: Number of items to load per page
 * - `sortBy`: Sorting criteria (e.g., 'likes' or 'createdAt')
 * - `searchQuery`: Optional keyword for fuzzy search
 * - `activeFilters`: Array of selected tags to filter POIs
 * - `feedCards`: DOM container where rendered POI cards will be appended
 * - `loadMore`: DOM element used to display "no more results" messages
 * - `setLoading`: Function to toggle the loading spinner state
 * - `favoritesMode`: If true, fetches only the user's saved POIs
 * 
 * Behavior:
 * - Constructs query string based on search and filter inputs
 * - Sends fetch request to backend endpoint (`/api/poi/all` or `/api/poi/favorites`)
 * - Renders each POI using `renderCard()` and appends to the feed container
 * - Displays appropriate message if no data is found
 */

import { renderCard } from '../utils/renderCard.js';

// Fetch POIs from DB
export async function loadPOIs({
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
        const baseUrl = favoritesMode ? '/api/poi/favorites' : '/api/poi/all';
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
        const res = await fetch(`${baseUrl}?${query}`, { credentials: 'include' });
        const data = await res.json();

        if (data.length === 0 && currentPage === 1) {
            loadMore.innerHTML = '<span class="text-muted">No results</span>';
            return null;
        } else if (data.length === 0) {
            loadMore.innerHTML = '<span class="text-muted">No more posts</span>';
            return null;
        }

        // Render each post card
        data.forEach(poi => {
            const voteKey = `vote_${poi._id}`;
            const card = renderCard(poi, voteKey, 'poi');
            card.id = `poi-${poi._id}`;//catch the poi position
            feedCards.appendChild(card);
        });

        if (data.length === 0 || data.length < limit) {
            loadMore.innerHTML = '<span class="text-muted">No more posts</span>';
            return null;
        }
          
        return currentPage + 1;
    } catch (err) {
        console.error('Failed to fetch POIs:', err);
        return null;
    } finally {
        setLoading(false);
    }
}
