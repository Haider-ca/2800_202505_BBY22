import { formatDate } from './helpers.js';

export function renderCard(post, voteKey = '', postType = 'post') {
    const votedType = voteKey ? localStorage.getItem(voteKey) : null;
    // like or dislike
    const likeIconClass = votedType === 'like' ? 'bi-hand-thumbs-up-fill' : 'bi-hand-thumbs-up';
    const dislikeIconClass = votedType === 'dislike' ? 'bi-hand-thumbs-down-fill' : 'bi-hand-thumbs-down';

    // hearted
    const isHearted = localStorage.getItem(`hearted-${post._id}`) === 'true';
    const heartIconClass = isHearted ? 'bi-heart-fill text-danger' : 'bi-heart';

    // saved
    const isSaved = localStorage.getItem(`saved-${post._id}`) === 'true';
    const saveIconClass = isSaved ? 'bi-bookmark-fill text-primary' : 'bi-bookmark';

    const card = document.createElement('div');
    card.className = 'card mb-3';

    card.innerHTML = `
    <div class="card-body">
      <div class="d-flex align-items-center mb-2">
        <div class="avatar me-2"></div>
        <div>
          <h6 class="mb-0">${post.username || 'Anonymous'}</h6>
          <small class="text-muted">${formatDate(post.createdAt)}</small>
        </div>
      </div>
      <img src="${post.imageUrl}" class="card-img-top mb-2" alt="Post Image">
      <p>${post.description}</p>
      <div class="d-flex justify-content-start gap-4 post-actions">
        <span class="like-btn" data-id="${post._id}" data-type="${postType}">
          <i class="bi ${likeIconClass}"></i> <span class="count">${post.likes || 0}</span>
        </span>
        <span class="dislike-btn" data-id="${post._id}" data-type="${postType}">
          <i class="bi ${dislikeIconClass}"></i> <span class="count">${post.dislikes || 0}</span>
        </span>
        <span class="d-none">
          <i class="bi bi-chat-dots"></i> ${post.comments?.length || 0}
        </span>
        <!--
        <span class="heart-btn" data-id="${post._id}">
          <i class="bi ${heartIconClass}"></i>
        </span>
        -->
        <span class="save-btn" data-id="${post._id}" data-type="${postType}">
          <i class="bi ${saveIconClass}"></i>
        </span>
      </div>
    </div>
  `;
    return card;
}
