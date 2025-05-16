 import { handleVoteClick } from "../utils/vote.js";

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
    
    <div class="d-flex justify-content-start gap-4 post-actions mt-2">
      <span class="like-btn" data-id="${properties._id}" data-type="poi">
        <i class="bi bi-hand-thumbs-up"></i>
        <span class="count">${properties.likes || 0}</span>
      </span>
      <span class="dislike-btn" data-id="${properties._id}" data-type="poi">
        <i class="bi bi-hand-thumbs-down"></i>
        <span class="count">${properties.dislikes || 0}</span>
      </span>
      <tab>
      <!-- Get Directions Button -->
    <div class="mt-2">
      <button class="popup-btn get-directions-btn" data-lng="${lng}" data-lat="${lat}">
        🧭
      </button>
    </div>
  </div>
    </div>
  </div>
`;




    return new mapboxgl.Popup({
        closeButton: true,
        closeOnClick: false,
        offset: 25,
    }).setHTML(content).setLngLat([lng, lat]);
}

// function formatDate(dateString) {
//     const d = new Date(dateString);
//     return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], {
//         hour: '2-digit',
//         minute: '2-digit',
//     });
// }


// export function createPopup({ coordinates, properties }) {
//     const [lng, lat] = coordinates;

//     const username = properties.username || 'Anonymous';
//     const rawTime = properties.time;
//     const time = rawTime ? formatDate(rawTime) : 'Unknown time';
//     const image = properties.image || '/icons/default.jpg';
//     const description = properties.description || 'No description available.';
//     const likes = properties.likes || 0;
//     const comments = properties.comments || 0;

//  const content = `
//   <div class="custom-popup">
//     <div class="popup-header">
//       <strong class="popup-username">${username}</strong><br>
//       <span class="popup-time">${time}</span>
//     </div>
//     <img src="${image}" alt="POI photo" class="popup-img" />
//     <div class="popup-desc">${description}</div>

//     <div class="popup-votes">
//       <button class="like-btn" data-id="${properties._id || properties.id}">
//         👍 <span class="count">${likes}</span>
//       </button>
//       <button class="dislike-btn" data-id="${properties._id || properties.id}">
//         👎
//       </button>
//       <span>💬 ${comments}</span>
//     </div>
//   </div>
// `;

//     return new mapboxgl.Popup({
//         closeButton: false,
//         closeOnClick: false,
//         offset: 25,
//     }).setHTML(content).setLngLat([lng, lat]);
// }