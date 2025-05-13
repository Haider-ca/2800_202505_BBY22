import { renderCard } from '../utils/renderCard.js';
import { getOrCreateVoterId } from '../utils/helpers.js';

// Fetch POIs from DB
export async function loadPOIs({
    currentPage,
    limit,
    sortBy,
    searchQuery,
    activeFilters,
    feedCards,
    loadMore,
    setLoading
  }) {
    setLoading(true);
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

        // const voterId = getOrCreateVoterId();

        // Render each post card
        data.forEach(poi => {
            const voteKey = `vote_${poi._id}`;
            const card = renderCard(poi, voteKey);
            // container.insertBefore(card, loadMore);
            feedCards.appendChild(card);
        });

        currentPage++;
    } catch (err) {
        console.error('Failed to fetch POIs:', err);
    } finally {
        setLoading(false);
        currentPage++;
    }
}