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