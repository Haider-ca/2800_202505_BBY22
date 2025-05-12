function formatDate(dateString) {
    const d = new Date(dateString);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function createPopup({ coordinates, properties }) {
    const [lng, lat] = coordinates;

    const username = properties.username || 'Anonymous';
    const rawTime = properties.time;
    const time = rawTime ? formatDate(rawTime) : 'Unknown time';
    const image = properties.image || '/icons/default.jpg';
    const description = properties.description || 'No description available.';
    const likes = properties.likes || 0;
    const comments = properties.comments || 0;

    const content = `
      <div class="custom-popup">
        <div class="popup-header">
          <strong class="popup-username">${username}</strong><br>
          <span class="popup-time">${time}</span>
        </div>
        <img src="${image}" alt="POI photo" class="popup-img" />
        <div class="popup-desc">${description}</div>
        <div class="popup-votes">
          <span>👍 ${likes}</span>
          <span>💬 ${comments}</span>
        </div>
      </div>
    `;

    return new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 25,
    }).setHTML(content).setLngLat([lng, lat]);
}