// src/script/poi.js
// POI MODULE — DO NOT MODIFY

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
              };
              reader.readAsDataURL(file);
            }
          });
        }
  
        // 5) Handle the POST
        const postBtn = document.getElementById("postBtn");
        if (postBtn) {
          postBtn.addEventListener("click", () => {
            const title = document.getElementById("poiTitle")?.value;
            const description = document.getElementById("poiDescription")?.value;
            const formData = new FormData();
            if (title)       formData.append("title", title);
            if (description) formData.append("description", description);
            if (photoInput?.files[0]) {
              formData.append("image", photoInput.files[0]);
            }
  
            fetch(`${CONFIG.API_BASE_URL}/api/poi`, {
              method: "POST",
              body: formData
            })
              .then(r => r.json())
              .then(data => {
                alert("POI submitted!");
                console.log("POI response:", data);
              })
              .catch(err => {
                console.error("POI submission error:", err);
                alert("Failed to submit POI");
              });
          });
        }
      })
      .catch(err => {
        console.error("Error loading POI form:", err);
      });
  });
  