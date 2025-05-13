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
    document.getElementById('avatar').src = data.avatar || '/img/defaultUser.png';
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
        const dropdown = document.querySelector(".dropdown");
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

// Function to set up dropdown menu behavior
function setupDropdown() {
    const menuIcon = document.querySelector(".menu-icon");
    const dropdown = document.querySelector(".dropdown");

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

// Event listener for DOM content loaded: Initialize events when the page is fully loaded
document.addEventListener("DOMContentLoaded", async() => {
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
    await loadProfile(); // Load profile information on page load
});