// public/config.js

// Your Mapbox public token:
window.MAPBOX_TOKEN = 'pk.eyJ1IjoiaGFpZGVyLTIwMjUiLCJhIjoiY205dXZ5YmIwMGQ0NTJpcTNzb2prYnZpOCJ9.QzrbaFW5l9KvuKO-cqOaFg';

// If Mapbox GL is already loaded, assign it immediately:
if (window.mapboxgl && typeof window.mapboxgl === 'object') {
  window.mapboxgl.accessToken = window.MAPBOX_TOKEN;
}

// const CONFIG = {
//   API_BASE_URL: 'http://localhost:5001' // Base URL for backend API
// };