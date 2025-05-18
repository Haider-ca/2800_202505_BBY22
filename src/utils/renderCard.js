/**
 * renderCard.js
 * 
 * This module provides a reusable function `renderCard(post, voteKey, postType)`
 * to generate dynamic post cards for the feed. Cards support various content types
 * including general posts, POIs (points of interest), and announcements. Each card
 * includes voting buttons, save functionality, media rendering, and optional location display.
 * 
 * For POI posts with coordinates, this module uses the Mapbox API to reverse-geocode
 * human-readable addresses and insert them into the card, along with a "Go" button to
 * navigate to the map view.
 * 
 * The logic of address resolution and input autofill for map.html was implemented
 * with the help of ChatGPT to enhance usability and modularity.
 */

import { formatDate } from './helpers.js';

// Render a post or POI card
export function renderCard(post, voteKey = '', postType = 'post') {
  // Determine vote state from localStorage
  const votedType = voteKey ? localStorage.getItem(voteKey) : null;
  // like or dislike
  const likeIconClass = votedType === 'like' ? 'bi-hand-thumbs-up-fill' : 'bi-hand-thumbs-up';
  const dislikeIconClass = votedType === 'dislike' ? 'bi-hand-thumbs-down-fill' : 'bi-hand-thumbs-down';

  // Check if hearted
  const isHearted = localStorage.getItem(`hearted-${post._id}`) === 'true';
  const heartIconClass = isHearted ? 'bi-heart-fill text-danger' : 'bi-heart';

  // Check if saved (prefer server-side flag, fallback to localStorage)
  const isSaved = (typeof post.isSaved === 'boolean')
    ? post.isSaved
    : localStorage.getItem(`saved-${post._id}`) === 'true';
  const saveIconClass = isSaved ? 'bi-bookmark-fill text-primary' : 'bi-bookmark';

  const card = document.createElement('div');
  card.className = 'card mb-3';

  // Render media (image or video)
  let mediaHTML = '';
  if (post.mediaUrl) {
    if (post.mediaType === 'video') {
      mediaHTML = `<video controls class="card-img-top mb-2 rounded" src="${post.mediaUrl}"></video>`;
    } else {
      mediaHTML = `<img src="${post.mediaUrl}" class="card-img-top mb-2 rounded" alt="Post Image">`;
    }
  } else if (post.imageUrl) {
    mediaHTML = `<img src="${post.imageUrl}" class="card-img-top mb-2 rounded" alt="POI Image">`;
  }

  // Post metadata
  const title = post.title || '';
  const description = postType === 'post'
    ? post.body || ''
    : postType === 'announcement' // Use mock data for MVP
      ? post.description || ''
      : post.description || '';

  // User avatar
  const avatarUrl = post.userId?.avatar || '/public/img/defaultUser.png';

  // Construct HTML
  card.innerHTML = `
    <div class="card-body">
      <div class="d-flex align-items-center mb-2">
        <div class="avatar me-2">
          <img src="${avatarUrl}" class="rounded-circle" style="width: 40px; height: 40px; object-fit: cover;" alt="avatar">
        </div>
        <div>
          <h6 class="mb-0">${post.username || 'Anonymous'}</h6>
          <small class="text-muted">${formatDate(post.createdAt)}</small>
        </div>
      </div>
      <h5 class="mt-2">${title}</h5>
      <p>${description}</p>
      ${mediaHTML}
      <div class="d-flex justify-content-start gap-4 post-actions">
        <span class="like-btn" data-id="${post._id}" data-type="${postType}">
          <i class="bi ${likeIconClass}"></i> <span class="count">${post.likes || 0}</span>
        </span>
        <span class="dislike-btn" data-id="${post._id}" data-type="${postType}">
          <i class="bi ${dislikeIconClass}"></i> <span class="count">${post.dislikes || 0}</span>
        </span>
        <span class="d-none">
          <i class="bi bi-chat-dots"></i> ${post.comments?.length || 0}
        </span>
        <span class="save-btn" data-id="${post._id}" data-type="${postType}">
          <i class="bi ${saveIconClass}"></i>
        </span>
      </div>
    </div>
  `;

  // If POI post with coordinates, display reverse-geocoded address
  if (postType === 'poi' && post.lat && post.lng) {
    const placeholder = document.createElement('div');
    placeholder.className = 'mb-2 text-muted small location-placeholder';
    placeholder.innerText = '📍 Loading address...';
    card.querySelector('.card-body').appendChild(placeholder);

    // Fetch human-readable address from Mapbox
    fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${post.lng},${post.lat}.json?access_token=${window.MAPBOX_TOKEN}`)
      .then(res => res.json())
      .then(data => {
        const address = data.features?.[0]?.place_name || 'Unknown location';
        
        placeholder.innerHTML = `
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-start bg-light p-3 rounded gap-2">
          <div class="text-muted small flex-grow-1">
            <i class="bi bi-geo-alt-fill me-1 text-danger"></i>
            ${address}
          </div>
          <div class="text-end">
            <a href="/html/map.html?lat=${post.lat}&lng=${post.lng}" 
               class="btn btn-sm btn-outline-primary rounded-pill shadow-sm">
              View on Map
            </a>
          </div>
        </div>
      `;
            
        // If on the map page, also pre-fill the destination input
        if (window.location.pathname.includes('/html/map.html')) {
          window.preselectedDestination = `${post.lng},${post.lat}`;
          const input = document.querySelector('#geocoder-end input');
          if (input) {
            input.value = address;
            input.dispatchEvent(new Event('input', { bubbles: true }));
          }
        }
      })
      .catch(err => {
        placeholder.innerText = '📍 Location unavailable';
        console.warn('Failed to fetch address:', err);
      });
  }

  return card;
}
