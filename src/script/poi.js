document.addEventListener("DOMContentLoaded", () => {
    // get html snippet of POI form
    fetch("../html/poi/poiForm.html")
        .then(res => res.text())
        .then(html => {
            // Insert POI form into map.html
            document.getElementById("poi-form-container").innerHTML = html;

            // Display POI form in map page
            const modal = document.getElementById("poiModal");
            if (modal) {
                modal.style.display = "block"; // !!!should be none, block is for test
            }

            // Upload photo
            document.getElementById("uploadBtn").addEventListener("click", () => {
                document.getElementById("photoInput").click();
            });

            // Display photo
            document.getElementById("photoInput").addEventListener("change", (event) => {
                const file = event.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = e => {
                        const preview = document.getElementById("photoPreview");
                        preview.src = e.target.result;
                        preview.classList.remove("d-none");
                    };
                    reader.readAsDataURL(file);
                }
            });

            // postBtn click event
            document.getElementById('postBtn').addEventListener('click', () => {
                console.log("Post button clicked");
                const title = document.getElementById('poiTitle').value;
                const description = document.getElementById('poiDescription').value;
                const photoInput = document.getElementById('photoInput');

                const formData = new FormData();
                formData.append('title', title);
                formData.append('description', description);
                if (photoInput.files[0]) {
                    formData.append('image', photoInput.files[0]);
                }

                fetch(`${CONFIG.API_BASE_URL}/api/poi`, {
                    method: 'POST',
                    body: formData
                })
                    .then(res => res.json())
                    .then(data => {
                        alert('POI submitted!');
                        console.log(data);
                    })
                    .catch(err => {
                        console.error('Error:', err);
                    });
            });

        });
});
