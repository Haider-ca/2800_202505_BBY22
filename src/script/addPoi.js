const map = window.pathpalMap;

let addingPOIMode = false; // Flag indicating whether user is in "add POI" mode
let tempPOIMarker = null; // Temporary red marker shown during POI selection

// Entry point to set up the POI creation feature
export function setupAddPOIFeature() {
  // Add the floating button to trigger POI creation
  createAddPOIButton();

  map.on("click", (e) => {
    if (addingPOIMode) {
      // When in "add" mode, handle map click as POI selection
      handlePOICreationClick(e);
    }
  });
}

// Creates the floating button for "Add POI"
function createAddPOIButton() {
  const poiBtn = document.createElement("button");
  poiBtn.id = "add-poi-btn";
  poiBtn.className = "poi-btn";
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

  document.getElementById("map").appendChild(poiBtn);
}

// Handles a click on the map while in "add POI" mode
function handlePOICreationClick(e) {
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