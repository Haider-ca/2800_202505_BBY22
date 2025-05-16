export async function loadRoutes({ currentPage, limit, feedCards, loadMore, setLoading }) {
    setLoading(true);

    try {
        const res = await fetch('/api/routes');
        const routes = await res.json();
        console.log(routes);

        if (!Array.isArray(routes) || routes.length === 0) {
            loadMore.innerHTML = '<span class="text-muted">No saved routes.</span>';
            return null;
        }

        routes.forEach((route, index) => {
            const card = document.createElement('div');
            card.className = 'card';

            const summary = route.summary || {};
            const steps = route.steps || [];

            const stepsHTML = steps.map((step, i) => `
          <li class="list-group-item">
            ${i + 1}. ${step.instruction} · ${step.distance} · ${step.duration}
          </li>
        `).join('');

            card.innerHTML = `
          <div class="card-body">
            <h5 class="card-title d-flex justify-content-between align-items-center">
              <span>${route.name || 'Saved Route'}</span>
              <span class="badge bg-primary">${route.profile}</span>
            </h5>
            <p class="card-text text-muted mb-1">Saved on ${new Date(route.createdAt).toLocaleDateString()}</p>
            <p class="card-text mb-2 fw-semibold">Total: ${summary.distance || '-'} · ETA ${summary.duration || '-'}</p>
  
            <div class="d-flex gap-2 mt-2">
                <button class="btn btn-sm btn-outline-secondary" data-bs-toggle="collapse" data-bs-target="#routeDetails${index}">
                    View Steps
                </button>
                <a class="btn btn-sm btn-success" href="/html/map.html?routeId=${route._id}">
                    Navigate on Map
                </a>
            </div>
            <div class="d-flex gap-2 mt-2">
            <div class="collapse mt-2" id="routeDetails${index}">
              <ul class="list-group list-group-flush">
                ${stepsHTML || `<li class="list-group-item text-muted">No directions available.</li>`}
              </ul>
            </div>
            </div>
          </div>
        `;

            feedCards.appendChild(card);
        });

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
