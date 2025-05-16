// Function to check authentication status
async function checkAuth() {
    const API_BASE_URL = '/api';
    const response = await fetch(API_BASE_URL + '/check-auth', {
        method: 'GET',
        credentials: 'include'
    });
    const data = await response.json();
    return data.loggedIn;
}

// Function to load user profile information from the server
async function loadProfile() {
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
        alert('Please log in to view your profile.');
        window.location.href = '/src/html/login/login.html';
        return;
    }

    const API_BASE_URL = '/api';
    const response = await fetch(API_BASE_URL + '/profile', { method: 'GET', credentials: 'include' });
    if (!response.ok) {
        alert('Failed to load profile. Please log in again.');
        window.location.href = '/html/login/login.html';
        return;
    }
    const data = await response.json();
    document.getElementById('avatarProfile').src = data.avatar || '/img/defaultUser.png';
    document.getElementById('email').textContent = data.email || '';
    document.getElementById('name').textContent = data.name || '';
    document.getElementById('description').textContent = data.description || '';
}

// Function to update user profile information and upload an image if provided
async function updateProfile(event) {
    event.preventDefault(); // Prevent default form submission behavior (reload page)
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
        alert('Please log in to update your profile.');
        window.location.href = '/src/html/login/login.html';
        return;
    }

    const formData = new FormData();
    formData.append('email', document.getElementById('newEmail').value);
    formData.append('name', document.getElementById('newName').value);
    formData.append('description', document.getElementById('newDescription').value);
    if (document.getElementById('avatarInput').files[0]) {
        formData.append('image', document.getElementById('avatarInput').files[0]);
    } else {
        console.log('No file selected for upload'); // Log when no file is selected
    }

    const API_BASE_URL = '/api';
    const response = await fetch(API_BASE_URL + '/profile', {
        method: 'PUT',
        body: formData,
        credentials: 'include'
    });
    if (response.ok) {
        document.getElementById('editForm').style.display = 'none'; // Hide edit form on success
        loadProfile(); // Reload profile information
    } else {
        const errorData = await response.json();
        alert('Failed to update profile: ' + (errorData.message || 'An unexpected error occurred')); // Display error message
    }
}

// Function to delete user profile after confirmation
async function deleteProfile() {
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
        alert('Please log in to delete your profile.');
        window.location.href = '/src/html/login/login.html';
        return;
    }

    if (confirm('Are you sure you want to delete your profile?')) {
        const API_BASE_URL = '/api';
        const response = await fetch(API_BASE_URL + '/profile', {
            method: 'DELETE',
            credentials: 'include'
        });
        if (response.ok) {
            alert('Profile deleted'); // Display success message
            window.location.href = '/'; // Redirect to home page
        } else {
            alert('Failed to delete profile'); // Display failure message
        }
    }
}

// Function to show the edit profile form
function showEditForm() {
    const editForm = document.getElementById('editForm');
    if (editForm) {
        editForm.style.display = 'block'; // Show the edit form
        const dropdown = document.querySelector(".dropdownMenu");
        if (dropdown) dropdown.classList.remove("show"); // Hide dropdown if visible
    } else {
        console.error('Edit form not found in DOM'); // Log error if form is not found
    }
}

// Function to hide the edit form and reset it
function cancelEdit() {
    const editForm = document.getElementById('editForm');
    if (editForm) {
        editForm.style.display = 'none'; // Hide the edit form
        document.getElementById('updateForm').reset(); // Reset form to initial state
        removeAvatarPreview();
    } else {
        console.error('Edit form not found in DOM'); // Log error if form is not found
    }
}

// Function to show the reset password modal
function showResetPasswordModal() {
    const resetPasswordModal = document.getElementById('resetPasswordModal');
    if (resetPasswordModal) {
        resetPasswordModal.classList.add('show');
        const dropdown = document.querySelector(".dropdownMenu");
        if (dropdown) dropdown.classList.remove("show");
    } else {
        console.error('Reset password modal not found in DOM');
    }
}

// Function to hide the reset password modal and reset it
function cancelResetPassword() {
    const resetPasswordModal = document.getElementById('resetPasswordModal');
    if (resetPasswordModal) {
        resetPasswordModal.classList.remove('show');
        document.getElementById('resetPasswordForm').reset();
    } else {
        console.error('Reset password modal not found in DOM');
    }
}

// Function to reset password
async function resetPassword(event) {
    event.preventDefault();
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
        alert('Please log in to reset your password.');
        window.location.href = '/src/html/login/login.html';
        return;
    }

    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {
        alert('Passwords do not match.');
        return;
    }

    const API_BASE_URL = '/api';
    const response = await fetch(API_BASE_URL + '/profile/reset-password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newPassword }),
        credentials: 'include'
    });

    if (response.ok) {
        alert('Password reset successfully.');
        cancelResetPassword();
    } else {
        const errorData = await response.json();
        alert('Failed to reset password: ' + (errorData.message || 'An unexpected error occurred'));
    }
}

// Function to set up dropdown menu behavior
function setupDropdown() {
    const menuIcon = document.querySelector(".menu-icon");
    const dropdown = document.querySelector(".dropdownMenu");

    if (menuIcon && dropdown) {
        menuIcon.addEventListener("click", (event) => {
            event.stopPropagation(); // Prevent click event from bubbling up
            dropdown.classList.toggle("show"); // Toggle dropdown visibility
        });

        document.addEventListener("click", (event) => {
            if (!menuIcon.contains(event.target) && !dropdown.contains(event.target)) {
                dropdown.classList.remove("show"); // Hide dropdown when clicking outside
            }
        });
    } else {
        console.error("Menu icon or dropdown not found in the DOM"); // Log error if elements are not found
    }
}

// Function to preview the selected avatar image
function previewAvatar(event) {
    const file = event.target.files[0];
    const previewContainer = document.getElementById('avatarPreviewContainer');
    const previewImage = document.getElementById('avatarPreview');

    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            previewImage.src = e.target.result;
            previewContainer.style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else {
        previewContainer.style.display = 'none';
    }
}

// Function to remove the avatar preview and reset the file input
function removeAvatarPreview() {
    const previewContainer = document.getElementById('avatarPreviewContainer');
    const previewImage = document.getElementById('avatarPreview');
    const avatarInput = document.getElementById('avatarInput');

    previewImage.src = '';
    previewContainer.style.display = 'none';
    avatarInput.value = '';
}

// Function to preview the selected POI image in the edit modal
function previewPoiImage(event, previewId) {
    const file = event.target.files[0];
    const previewImage = document.getElementById(previewId);

    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            previewImage.src = e.target.result;
            previewImage.style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else {
        previewImage.style.display = 'none';
    }
}

// Function to remove the POI image preview and reset the file input
function removePoiImagePreview(previewId, inputId) {
    const previewImage = document.getElementById(previewId);
    const imageInput = document.getElementById(inputId);

    previewImage.src = '';
    previewImage.style.display = 'none';
    imageInput.value = '';
}

// Function to load and display user POIs with pagination, search, sort, and filter
async function loadUserPOIs() {
    const feedContainer = document.getElementById('user-poi-feed');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');

    const limit = 3;
    let currentPage = parseInt(localStorage.getItem('profilePage') || '1');
    const searchQuery = document.getElementById('search-input').value.trim();
    const sortBy = document.getElementById('sortToggleBtn').dataset.sort || 'createdAt';
    const activeFilters = Array.from(document.querySelectorAll('.form-check-input:checked'))
        .map(cb => cb.value);

    try {
        const profileResponse = await fetch('/api/profile', { credentials: 'include' });
        if (!profileResponse.ok) {
            throw new Error(`Failed to fetch profile: ${profileResponse.status}`);
        }
        const profileData = await profileResponse.json();
        const userId = profileData._id;
        if (!userId) {
            throw new Error('User ID not found in profile data');
        }

        const query = new URLSearchParams({
            userId,
            limit,
            page: currentPage,
            sort: sortBy,
        });
        if (searchQuery) query.append('q', searchQuery);
        if (activeFilters.length > 0) query.append('filter', activeFilters.join(','));

        const res = await fetch(`/api/profile/pois?${query}`);
        if (!res.ok) {
            throw new Error(`Failed to fetch POIs: ${res.status}`);
        }
        const pois = await res.json();

        feedContainer.innerHTML = '';

        if (!pois.length && currentPage > 1) {
            currentPage--;
            localStorage.setItem('profilePage', currentPage);
            loadUserPOIs();
            return;
        } else if (!pois.length) {
            feedContainer.innerHTML = `<span class="text-muted">No POIs found for userId: ${userId}</span>`;
            nextPageBtn.disabled = true;
            return;
        }

        pois.forEach(poi => {
            const card = document.createElement('div');
            card.className = 'card mb-3 position-relative';
            card.innerHTML = `
                <div class="card-body">
                    <div class="position-absolute top-0 end-0 p-2 d-flex gap-1">
                        <button class="btn btn-sm btn-outline-primary edit-btn" data-id="${poi._id}" title="Edit">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${poi._id}" title="Delete">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                    <div class="d-flex align-items-center mb-2">
                        <div class="avatar me-2">
                            <img src="${poi.avatar || '/img/defaultUser.png'}" alt="User Avatar" style="width: 40px; height: 40px; border-radius: 50%;">
                        </div>
                        <div>
                            <h6 class="mb-0">${poi.username || 'Anonymous'}</h6>
                            <small class="text-muted">${new Date(poi.createdAt).toLocaleString()}</small>
                        </div>
                    </div>
                    <h5 class="card-title">${poi.title || 'Untitled'}</h5>
                    <img src="${poi.imageUrl}" class="card-img-top mb-2" alt="POI Image">
                    <p>${poi.description || 'No description'}</p>
                    <div class="d-flex justify-content-start gap-4 post-actions">
                        <span class="like-btn" data-id="${poi._id}">
                            <i class="bi bi-hand-thumbs-up"></i> <span class="count">${poi.likes || 0}</span>
                        </span>
                        <span class="dislike-btn" data-id="${poi._id}">
                            <i class="bi bi-hand-thumbs-down"></i> <span class="count">${poi.dislikes || 0}</span>
                        </span>
                    </div>
                </div>
            `;
            feedContainer.appendChild(card);
        });

        // Add event listeners to edit buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const poiId = e.currentTarget.dataset.id;
                const poi = pois.find(p => p._id === poiId); // find the POI object by ID

                // Get the list of tags from the filter checkboxes
                const filterCheckboxes = document.querySelectorAll('.form-check-input');
                const availableTags = Array.from(filterCheckboxes).map(cb => cb.value);
                const tagCheckboxes = availableTags.map(tag => `
                    <div class="form-check form-check-inline">
                        <input class="form-check-input" type="checkbox" name="tags-${poiId}" value="${tag}" ${poi.tags.includes(tag) ? 'checked' : ''}>
                        <label class="form-check-label">${tag}</label>
                    </div>
                `).join('');

                //create modal for editing
                const modal = document.createElement('div');
                modal.className = 'modal fade';
                modal.id = `editModal-${poiId}`;
                modal.tabIndex = '-1';
                modal.role = 'dialog';
                modal.innerHTML = `
                    <div class="modal-dialog" role="document">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Edit POI</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <form id="editForm-${poiId}">
                                    <div class="mb-3">
                                        <label for="title-${poiId}" class="form-label">Title</label>
                                        <input type="text" class="form-control" id="title-${poiId}" value="${poi.title || ''}">
                                    </div>
                                    <div class="mb-3">
                                        <label for="description-${poiId}" class="form-label">Description</label>
                                        <textarea class="form-control" id="description-${poiId}" rows="3">${poi.description || ''}</textarea>
                                    </div>
                                    <div class="mb-3">
                                        <label for="image-${poiId}" class="form-label">Image</label>
                                        <input type="file" class="form-control" id="image-${poiId}" accept="image/*">
                                        <div id="poiPreviewContainer-${poiId}" style="display: ${poi.imageUrl ? 'block' : 'none'}; margin-top: 10px;">
                                            <img id="poiPreview-${poiId}" src="${poi.imageUrl || ''}" alt="POI Preview" style="max-width: 100%;">
                                            <button type="button" class="btn btn-sm btn-danger mt-2" onclick="removePoiImagePreview('poiPreview-${poiId}', 'image-${poiId}')">Remove</button>
                                        </div>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Tags</label>
                                        <div>
                                            ${tagCheckboxes}
                                        </div>
                                    </div>
                                    <button type="submit" class="btn btn-primary">Save Changes</button>
                                </form>
                            </div>
                        </div>
                    </div>
                `;
                document.body.appendChild(modal);

                //Initialize Bootstrap modal
                const bootstrapModal = new bootstrap.Modal(modal);
                bootstrapModal.show();

                //Handle image preview
                document.getElementById(`image-${poiId}`).addEventListener('change', (event) => {
                    previewPoiImage(event, `poiPreview-${poiId}`);
                });

                // Handle form submission
                document.getElementById(`editForm-${poiId}`).addEventListener('submit', async (event) => {
                    event.preventDefault();

                    const formData = new FormData();
                    formData.append('title', document.getElementById(`title-${poiId}`).value);
                    formData.append('description', document.getElementById(`description-${poiId}`).value);
                    const tagInputs = document.querySelectorAll(`input[name="tags-${poiId}"]:checked`);
                    const selectedTags = Array.from(tagInputs).map(input => input.value);
                    formData.append('tags', JSON.stringify(selectedTags));

                    const imageFile = document.getElementById(`image-${poiId}`).files[0];
                    if (imageFile) {
                        formData.append('image', imageFile);
                    }

                    try {
                        const response = await fetch(`/api/profile/pois/${poiId}`, {
                            method: 'PUT',
                            body: formData,
                            credentials: 'include'
                        });

                        if (response.ok) {
                            bootstrapModal.hide();
                            loadUserPOIs();
                        } else {
                            const errorData = await response.json();
                            throw new Error(errorData.message || 'Failed to update POI');
                        }
                    } catch (err) {
                        console.error('Error updating POI:', err);
                        alert('Failed to update POI: ' + err.message);
                    }
                });

                // Delete modal when hidden
                modal.addEventListener('hidden.bs.modal', () => {
                    modal.remove();
                });
            });
        });

        // Add event listener for delete button
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const poiId = e.currentTarget.dataset.id;
                if (confirm('Are you sure you want to delete this POI?')) {
                    try {
                        const response = await fetch(`/api/profile/pois/${poiId}`, {
                            method: 'DELETE',
                            credentials: 'include'
                        });

                        if (response.ok) {
                            alert('POI deleted successfully');
                            loadUserPOIs();
                        } else {
                            const errorData = await response.json();
                            throw new Error(errorData.message || 'Failed to delete POI');
                        }
                    } catch (err) {
                        console.error('Error deleting POI:', err);
                        alert('Failed to delete POI: ' + err.message);
                    }
                }
            });
        });

        prevPageBtn.disabled = currentPage === 1;
        pageInfo.textContent = `Page ${currentPage}`;
        nextPageBtn.disabled = pois.length < limit;
        localStorage.setItem('profilePage', currentPage);
    } catch (err) {
        console.error('Failed to fetch user POIs:', err);
        feedContainer.innerHTML = '<span class="text-muted">Error loading POIs</span>';
    }
}

// Event listener for DOM content loaded
document.addEventListener("DOMContentLoaded", () => {
    setupDropdown(); // Initialize dropdown functionality
    const updateForm = document.getElementById('updateForm');
    if (updateForm) {
        updateForm.addEventListener('submit', updateProfile); // Attach submit event to form
    } else {
        console.error('Update form not found in DOM'); // Log error if form is not found
    }
    const avatarInput = document.getElementById('avatarInput');
    if (avatarInput) {
        avatarInput.addEventListener('change', previewAvatar);
    }

    const resetPasswordForm = document.getElementById('resetPasswordForm');
    if (resetPasswordForm) {
        resetPasswordForm.addEventListener('submit', resetPassword);
    } else {
        console.error('Reset password form not found in DOM');
    }
    loadProfile();
    loadUserPOIs();

    // Setup search
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            localStorage.setItem('profilePage', 1);
            loadUserPOIs();
        });
    }

    // Setup sort
    const sortToggleBtn = document.getElementById('sortToggleBtn');
    if (sortToggleBtn) {
        sortToggleBtn.addEventListener('click', () => {
            const currentSort = sortToggleBtn.dataset.sort || 'createdAt';
            sortToggleBtn.dataset.sort = currentSort === 'createdAt' ? 'likes' : 'createdAt';
            document.getElementById('sortLabel').textContent = sortToggleBtn.dataset.sort === 'likes' ? 'Most liked' : 'Newest';
            localStorage.setItem('profilePage', 1);
            loadUserPOIs();
        });
    }

    // Setup filter
    document.querySelectorAll('.form-check-input').forEach(cb => {
        cb.addEventListener('change', () => {
            localStorage.setItem('profilePage', 1);
            loadUserPOIs();
        });
    });

    // Setup pagination
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    if (prevPageBtn && nextPageBtn) {
        prevPageBtn.addEventListener('click', () => {
            const currentPage = parseInt(localStorage.getItem('profilePage') || '1');
            if (currentPage > 1) {
                localStorage.setItem('profilePage', currentPage - 1);
                loadUserPOIs();
            }
        });
        nextPageBtn.addEventListener('click', () => {
            const currentPage = parseInt(localStorage.getItem('profilePage') || '1');
            localStorage.setItem('profilePage', currentPage + 1);
            loadUserPOIs();
        });
    }
});