import { reverseGeocodeDisplay } from '../utils/helpers.js';
import { showToast } from '../utils/toast.js';

export async function loadRoutes({ currentPage, limit, feedCards, loadMore, setLoading }) {
  setLoading(true);

  try {
    const res = await fetch('/api/routes');
    const routes = await res.json();

    if (!Array.isArray(routes) || routes.length === 0) {
      loadMore.innerHTML = '<span class="text-muted">No saved routes.</span>';
      return null;
    }

    for (let index = 0; index < routes.length; index++) {
      const route = routes[index];
      const card = document.createElement('div');
      card.className = 'card';

      const summary = route.summary || {};
      const steps = route.steps || [];

      const stepsHTML = steps.map((step, i) => `
        <li class="list-group-item">
          ${i + 1}. ${step.instruction} · ${step.distance} · ${step.duration}
        </li>
      `).join('');

      const coords = route.geometry?.coordinates || [];
      const start = coords[0];
      const end = coords[coords.length - 1];

      let startFull = 'Unknown', endFull = 'Unknown';
      let startShort = 'From', endShort = 'To';

      if (start && end) {
        [startFull, endFull] = await Promise.all([
          reverseGeocodeDisplay(start),
          reverseGeocodeDisplay(end)
        ]);

        startShort = startFull.split(',')[0] || 'From';
        endShort = endFull.split(',')[0] || 'To';
      }

      card.innerHTML = `
        <div class="card-body">
          <div class="route-info d-flex justify-content-between">
            <div class="address-lines flex-grow-1">
              <div class="address-line d-flex mb-2">
                <span class="label me-2 text-muted">📍 From</span>
                <span class="address flex-grow-1" title="${startFull}">${shortenAddress(startFull)}</span>
              </div>
              <div class="address-line d-flex">
                <span class="label me-2 text-muted">🎯 To</span>
                <span class="address flex-grow-1" title="${endFull}">${shortenAddress(endFull)}</span>
              </div>
            </div>
            <span class="badge bg-primary route-profile">${route.profile}</span>
          </div>

          <p class="card-text text-muted mb-1" style="font-size: 0.825rem;">
            Saved on ${new Date(route.createdAt).toLocaleDateString()}
          </p>
          <p class="card-text mb-2 fw-semibold">
            Total: ${summary.distance || '-'} · ETA ${summary.duration || '-'}
          </p>

          <div class="d-flex gap-2 mt-2">
            <button class="btn btn-sm btn-outline-secondary" data-bs-toggle="collapse" data-bs-target="#routeDetails${index}">
              View Steps
            </button>
            <a class="btn btn-sm btn-success" href="/html/map.html?routeId=${route._id}">
              Navigate on Map
            </a>
            <button class="btn btn-sm text-muted unsave-btn ms-auto" data-id="${route._id}">
              <i class="bi bi-bookmark-x"></i> Unsave
            </button>
          </div>

          <div class="collapse mt-2" id="routeDetails${index}">
            <ul class="list-group list-group-flush">
              ${stepsHTML || `<li class="list-group-item text-muted">No directions available.</li>`}
            </ul>
          </div>
        </div>
      `;

      // Unsave button
      card.querySelector('.unsave-btn')?.addEventListener('click', async (e) => {
        const routeId = e.currentTarget.dataset.id;
        const cardEl = e.currentTarget.closest('.card');

        try {
          const res = await fetch(`/api/routes/${routeId}`, { method: 'DELETE' });
          if (!res.ok) throw new Error('Failed to remove route');

          // Remove the card
          cardEl.classList.add('fade-out');
          setTimeout(() => cardEl.remove(), 300);

          // Show toast notification
          showToast('Route removed from saved list.', 'info', 3000);

        } catch (err) {
          console.error(err);
          showToast('Failed to remove route.', 'error');
        }
      });

      feedCards.appendChild(card);
    }

    // Initialize tooltips
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipTriggerList.forEach(el => new bootstrap.Tooltip(el));

    loadMore.innerHTML = '<span class="text-muted">No more routes.</span>';
    return null;
  } catch (err) {
    console.error('Error loading routes:', err);
    loadMore.innerHTML = '<span class="text-danger">Failed to load routes.</span>';
    return null;
  } finally {
    setLoading(false);
  }
}