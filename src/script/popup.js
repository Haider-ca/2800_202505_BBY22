import { formatDate } from '../utils/helpers.js';

export function createPopup({ coordinates, properties }) {
  const [lng, lat] = coordinates;

  const username = properties.username || 'Anonymous';
  const rawTime = properties.createdAt || properties.time;
  const time = rawTime ? formatDate(rawTime) : 'Unknown time';
  const image = properties.image || properties.imageUrl || '/icons/default.jpg';
  const description = properties.description || 'No description available.';

  const content = `
    <div class="custom-popup">
      <div class="popup-header">
        <strong class="popup-username">${username}</strong><br>
        <span class="popup-time">${time}</span>
      </div>
      <img src="${image}" alt="POI photo" class="popup-img" />
      <div class="popup-desc">${description}</div>
      
      <div class="d-flex justify-content-start gap-4 post-actions mt-2">
        <span class="like-btn" data-id="${properties._id}" data-type="poi">
          <i class="bi bi-hand-thumbs-up"></i>
          <span class="count">${properties.likes || 0}</span>
        </span>
        <span class="dislike-btn" data-id="${properties._id}" data-type="poi">
          <i class="bi bi-hand-thumbs-down"></i>
          <span class="count">${properties.dislikes || 0}</span>
        </span>
      </div>

      <div class="mt-2 text-end">
        <button class="btn btn-outline-primary btn-sm get-directions-btn" data-lng="${lng}" data-lat="${lat}">
          <i class="bi bi-compass"></i> Navigate
        </button>
      </div>
    </div>
  `;

  const popup = new mapboxgl.Popup({
    closeButton: true,
    closeOnClick: false,
    offset: 25,
  }).setHTML(content).setLngLat([lng, lat]);

  popup.on('open', () => {
    const container = popup.getElement();
    if (!container || container.classList.contains('events-attached')) return;
    container.classList.add('events-attached');

    const likeBtn = container.querySelector('.like-btn');
    const dislikeBtn = container.querySelector('.dislike-btn');
    const directionsBtn = container.querySelector('.get-directions-btn');

    const voteKey = `vote_${properties._id}`;
    const previousVote = localStorage.getItem(voteKey);
    if (previousVote === 'like') {
      likeBtn?.querySelector('i')?.classList.replace('bi-hand-thumbs-up', 'bi-hand-thumbs-up-fill');
    } else if (previousVote === 'dislike') {
      dislikeBtn?.querySelector('i')?.classList.replace('bi-hand-thumbs-down', 'bi-hand-thumbs-down-fill');
    }

    directionsBtn?.addEventListener('click', () => {
      const lat = directionsBtn.dataset.lat;
      const lng = directionsBtn.dataset.lng;

      const coordStr = `${lng},${lat}`;

      // URL parameters
      const newParams = new URLSearchParams(window.location.search);
      newParams.set('type', 'user-poi-popup');
      newParams.set('lat', lat);
      newParams.set('lng', lng);

      // Use pushState to avoid full page reload
      const newURL = `${window.location.pathname}?${newParams.toString()}`;
      window.history.pushState({}, '', newURL);

      // Set destination marker and input value
      if (window.pathpalDirections?.setDestination) {
        window.pathpalDirections.setDestination(coordStr);
      }

      // Autofill end input field
      if (typeof window.autoFillEndInputFromURL === 'function') {
        window.autoFillEndInputFromURL();
      }

      // Fly to target coordinates on the map
      window.pathpalMap.flyTo({ center: [parseFloat(lng), parseFloat(lat)], zoom: 14 });
    });
  });

  return popup;
}