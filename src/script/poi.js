/**
 * POI Form Module
 * 
 * Handles the dynamic loading and submission of the POI (Point of Interest) form,
 * including image preview, form validation, marker placement, and form reset.
 * 
 * Key Features:
 * - Loads POI form from HTML partial and injects into the page
 * - Validates user inputs and displays inline error messages
 * - Previews selected image before upload
 * - Submits POI data via POST with FormData including coordinates and tags
 * - Adds custom markers to Mapbox map upon successful submission
 * - Uses toast notification for success/failure feedback
 */

import { showToast } from '../utils/toast.js';
import { createPopup } from './popup.js';

document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("poi-form-container");
    if (!container) {
      console.warn("⚠️  #poi-form-container not found, skipping POI form load");
      return;
    }
  
    // 1) Load the HTML snippet
    fetch("/partials/poiForm.html")
      .then(res => {
        if (!res.ok) throw new Error(`Could not load form: ${res.status}`);
        return res.text();
      })
      .then(html => {
        // 2) Inject into the page
        container.innerHTML = html;
  
        // 3) Hide the modal by default
        const modal = document.getElementById("poiModal");
        if (modal) modal.style.display = "none";
  
        // 4) Wire up your upload button
        const uploadBtn = document.getElementById("uploadBtn");
        const photoInput = document.getElementById("photoInput");
        const photoPreview = document.getElementById("photoPreview");
        if (uploadBtn && photoInput) {
          uploadBtn.addEventListener("click", () => photoInput.click());
          photoInput.addEventListener("change", event => {
            const file = event.target.files[0];
            if (file && photoPreview) {
              const reader = new FileReader();
              reader.onload = e => {
                photoPreview.src = e.target.result;
                photoPreview.classList.remove("d-none");
                // Clear error message
                const errorEl = document.getElementById("uploadError");
                if (errorEl) errorEl.style.display = "none";
              };
              reader.readAsDataURL(file);
            }
          });
        }
  
        // 5) Close form
        const closeBtn = document.getElementById("closePOI");
        if (closeBtn && modal) {
          closeBtn.addEventListener("click", () => {
            resetPOIForm();
            modal.style.display = "none";
          });
        }

        // 6) Handle the POST
        const postBtn = document.getElementById("postBtn");
        if (postBtn) {
          postBtn.addEventListener("click", () => {
            const titleInput = document.getElementById("poiTitle");
            const descInput = document.getElementById("poiDescription");

            const title = titleInput?.value.trim();
            const description = descInput?.value.trim();
            const errorEl = document.getElementById("uploadError");
            const titleError = document.getElementById("titleError");
            const descError = document.getElementById("descError");

            // Clear error message
            if (errorEl) errorEl.style.display = "none";
            if (titleError) titleError.style.display = "none";
            if (descError) descError.style.display = "none";

            // Input check
            let hasError = false;

            if (!title) {
              if (titleError) {
                titleError.innerText = "Title is required.";
                titleError.style.display = "block";
              }
              hasError = true;
            }

            if (!description) {
              if (descError) {
                descError.innerText = "Description is required.";
                descError.style.display = "block";
              }
              hasError = true;
            }

            if (!photoInput?.files[0]) {
              if (errorEl) {
                errorEl.innerText = "Please upload a photo before submitting.";
                errorEl.style.display = "block";
              }
              hasError = true;
            }

            if (hasError) return;

            const formData = new FormData();
            if (title)       formData.append("title", title);
            if (description) formData.append("description", description);
            const tags = Array.from(document.querySelectorAll('input[name="tags"]:checked')).map(cb => cb.value);
            formData.append("tags", JSON.stringify(tags));
            if (photoInput?.files[0]) {
              formData.append("image", photoInput.files[0]);
            }
            // Add coordinates
            const { lng, lat } = window.clickedLatLng || {};
            if (lng) formData.append("lng", lng);
            if (lat) formData.append("lat", lat);

            fetch(`/api/poi`, {
              method: "POST",
              body: formData,
              credentials: 'include'
            })
              .then(async res => {
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Failed to submit POI');
                return data;
              })
              .then(async data => {
                console.log("POI response:", data);
                // 1. Read coordinates
                const res = await fetch(`/api/poi/${data.poi._id}`);
                const poi = await res.json();
                const { lng, lat } = window.clickedLatLng || {};

                if (lng && lat) {
                  // 2. Create marker element
                  // Generated with the help of ChatGPT (OpenAI)
                  const el = document.createElement('div');
                  el.className = 'custom-marker';
                  el.style.backgroundImage = `url(/icons/poi.png)`;
                  el.style.width = '32px';
                  el.style.height = '32px';
                  el.style.backgroundSize = 'contain';

                  // 3. Create popup
                  const popup = createPopup({
                    coordinates: [lng, lat],
                    properties: {
                      ...poi,
                      image: poi.imageUrl,
                    }
                  });
                  popup.addTo(window.pathpalMap).setLngLat([lng, lat]);

                  // 4. Add popup to the marker, and add marker to the map
                  // Generated with the help of ChatGPT (OpenAI)
                  const marker = new mapboxgl.Marker(el)
                  .setLngLat([lng, lat])
                  .setPopup(popup)
                  .addTo(window.pathpalMap);

                  if (window.userPOIMarkers) {
                    window.userPOIMarkers.push(marker);
                  }
                  marker.togglePopup();
                }

                // 4. Show message
                showToast('POI submitted successfully!', 'success');

                // 5. Clear form
                resetPOIForm();

                // 6. Hide the form modal
                if (modal) modal.style.display = "none";
              })
              .catch(err => {
                console.error("POI submission error:", err);
                showToast(err.message || "Failed to submit POI", 'error');
              });
          });
        }
      })
      .catch(err => {
        console.error("Error loading POI form:", err);
      });

      function resetPOIForm() {
        const titleInput = document.getElementById("poiTitle");
        const descriptionInput = document.getElementById("poiDescription");
        const photoInput = document.getElementById("photoInput");
        const photoPreview = document.getElementById("photoPreview");

        const errorEl = document.getElementById("uploadError");
        const titleError = document.getElementById("titleError");
        const descError = document.getElementById("descError");
        
      
        if (titleInput) titleInput.value = "";
        if (descriptionInput) descriptionInput.value = "";
      
        document.querySelectorAll('input[name="tags"]:checked')
          .forEach(cb => cb.checked = false);
      
        if (photoPreview) {
          photoPreview.src = "";
          photoPreview.classList.add("d-none");
        }
      
        if (photoInput) photoInput.value = "";

        // Clear error message
        if (errorEl) errorEl.style.display = "none";
        if (titleError) titleError.style.display = "none";
        if (descError) descError.style.display = "none";
      
        window.clickedLatLng = null;
      }
      
  });
  