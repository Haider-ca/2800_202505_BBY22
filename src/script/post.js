/**
 * Post Submission Module (`post.js`)
 * 
 * Handles the creation and submission of general (community) posts,
 * including support for image/video preview, form validation, and toast feedback.
 * 
 * Key Responsibilities:
 * - Supports media upload (image or video, not both) with preview and clear option
 * - Prevents form submission without title
 * - Submits post content as `FormData` to the `/api/post` endpoint
 * - Displays Bootstrap-style toast notification on success or failure
 * - Redirects user to the community feed after successful submission
 * 
 * DOM Elements:
 * - `#postForm`: the main submission form
 * - `#imageUpload` / `#videoUpload`: input fields for media selection
 * - `#mediaPreview`: container for previewing uploaded media
 * 
 * Used in:
 * - `post.html`
 */

import { showToast } from '../utils/toast.js';

document.addEventListener('DOMContentLoaded', () => {

    const postForm = document.getElementById('postForm');
    const imageInput = document.getElementById('imageUpload');
    const videoInput = document.getElementById('videoUpload');
    const mediaPreview = document.getElementById('mediaPreview');

    function clearMedia() {
        mediaPreview.innerHTML = '';
        imageInput.value = '';
        videoInput.value = '';
    }

    function createClearButton() {
        const btn = document.createElement('button');
        btn.innerHTML = '&times;';
        btn.className = 'btn btn-sm btn-danger position-absolute top-0 end-0 m-2';
        btn.style.zIndex = '10';
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            clearMedia();
        });
    
        return btn;
    }

    imageInput.addEventListener('change', () => {
        const file = imageInput.files[0];
        if (file) {
            const wrapper = document.createElement('div');
            wrapper.className = 'position-relative';
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            img.className = 'img-fluid rounded';
            wrapper.appendChild(img);
            wrapper.appendChild(createClearButton());
            mediaPreview.innerHTML = '';
            mediaPreview.appendChild(wrapper);
            videoInput.value = '';
        }
    });

    videoInput.addEventListener('change', () => {
        const file = videoInput.files[0];
        if (file) {
            const wrapper = document.createElement('div');
            wrapper.className = 'position-relative';
            const video = document.createElement('video');
            video.src = URL.createObjectURL(file);
            video.controls = true;
            video.className = 'w-100';
            wrapper.appendChild(video);
            wrapper.appendChild(createClearButton());
            mediaPreview.innerHTML = '';
            mediaPreview.appendChild(wrapper);
            imageInput.value = '';
        }
    });

    postForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('postTitle').value.trim();
        const body = document.getElementById('postBody').value.trim();
        const imageFile = document.getElementById('imageUpload').files[0];
        const videoFile = document.getElementById('videoUpload').files[0];
        const mediaFile = imageFile || videoFile;

        if (!title) {
            alert('Title is required.');
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('body', body);
        if (mediaFile) {
            formData.append('media', mediaFile);
        }

        try {
            const res = await fetch('/api/post', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();

            if (res.ok) {
                showToast('Boom! Your post is out there!', 'success');
                setTimeout(() => {
                    window.location.href = '/html/feed.html?mode=community';
                }, 1500);
            } else {
                showToast(data.error || 'Failed to post', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Something went wrong', 'error');
        }
    });

});