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
                    <!-- Nút Edit và Delete ở góc phải trên cùng -->
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
                    <img src="${poi.imageUrl}" class="card-img-top mb-2" alt="POI Image">
                    <p>${poi.description}</p>
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

        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const poiId = e.currentTarget.dataset.id;
            });
        });

        // Thêm sự kiện cho nút Delete
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const poiId = e.currentTarget.dataset.id;
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