// src/script/addPoi.js

// shared module‐scope state
let addingPOIMode  = false;
let tempPOIMarker  = null;

export function setupAddPOIFeature() {
  console.log('🔘 setupAddPOIFeature() called');
  const map = window.pathpalMap;
  if (!map) {
    console.error('AddPOI: map not initialized yet');
    return;
  }

  // 1) inject the button & wire its click (helper uses those same state vars)
  createAddPOIButton();

  // 2) listen for map clicks while in POI mode
  map.on('click', e => {
    if (addingPOIMode) {
      handlePOICreationClick(e);
    }
  });
}

// Creates the floating button for "Add POI"
function createAddPOIButton() {
  console.log('⚙️ createAddPOIButton() running');
  // const poiBtn = document.createElement("button");
    const map = window.pathpalMap;
  if (!map) return console.error('AddPOI: map not initialized');
  const poiBtn = document.createElement("button");
  poiBtn.id = "add-poi-btn";
  poiBtn.className = "poi-btn";

 // inline fallback positioning
 poiBtn.style.position = 'fixed';
 poiBtn.style.bottom   = '80px';
 poiBtn.style.right    = '10px';
 poiBtn.style.zIndex   = '10000';


  poiBtn.setAttribute("aria-label", "Add POI");

  poiBtn.addEventListener("click", () => {
    addingPOIMode = true;
    showInstruction("Click a location on the map for your new POI.");
    // move the map to user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          map.flyTo({
            center: [longitude, latitude],
            zoom: 15
          });
          // Simulate a map click at user's current location
          const fakeEvent = {
            lngLat: {
              lat: latitude,
              lng: longitude
            }
          };
          handlePOICreationClick(fakeEvent);
        },
        (err) => {
          console.warn("Geolocation failed", err);
        },
        { enableHighAccuracy: true }
      );
    } else {
      console.warn("Geolocation not supported by this browser");
    }
  });

  // document.getElementById("map").appendChild(poiBtn);
  document.body.appendChild(poiBtn);
}

// Handles a click on the map while in "add POI" mode
function handlePOICreationClick(e) {
    const map = window.pathpalMap;
  if (!map) return console.error('AddPOI: map not initialized in click handler');
  const { lng, lat } = e.lngLat;

  // Remove any existing temporary marker
  if (tempPOIMarker) {
    tempPOIMarker.remove();
    tempPOIMarker = null;
  }

  const popupContent = `
    <div class="poi-popup">
      <p class="popup-title">Use this location?</p>
      <button id="confirm-poi-location" class="popup-btn">Add to Map</button>
    </div>
  `;

  // Place a red marker with popup on the map
  const popup = new mapboxgl.Popup().setHTML(popupContent);
  tempPOIMarker = new mapboxgl.Marker({ color: 'red' })
    .setLngLat([lng, lat])
    .setPopup(popup)
    .addTo(map)
    .togglePopup();

  setTimeout(() => {
    const confirmBtn = document.getElementById("confirm-poi-location");
    if (confirmBtn) {
      confirmBtn.addEventListener("click", () => {
        window.clickedLatLng = e.lngLat;
        const modal = document.getElementById("poiModal");
        if (modal) modal.style.display = "block";
        cleanUp(); // Exit "add POI" mode
      });
    }

    const closeBtn = document.querySelector(".mapboxgl-popup-close-button");
    if (closeBtn) {
      closeBtn.addEventListener("click", cleanUp);
    }
  }, 50);
}

// Clear the state after user confirms or cancels POI creation
function cleanUp() {
  addingPOIMode = false;
  hideInstruction();
  if (tempPOIMarker) {
    tempPOIMarker.remove();
    tempPOIMarker = null;
  }
}

// Show a floating instruction on the map
function showInstruction(message) {
  let el = document.getElementById("map-instruction");
  if (!el) {
    el = document.createElement("div");
    el.id = "map-instruction";
    el.className = "map-instruction";
    document.getElementById("map").appendChild(el);
  }
  el.innerText = message;
  el.style.display = "block";
}

// Hide the instruction
function hideInstruction() {
  const el = document.getElementById("map-instruction");
  if (el) el.style.display = "none";
}