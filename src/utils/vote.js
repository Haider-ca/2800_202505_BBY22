import { getOrCreateVoterId } from '../../utils/helpers.js';

export async function handleVoteClick(e, contentType = 'post') {
  const likeBtn = e.target.closest('.like-btn');
  const dislikeBtn = e.target.closest('.dislike-btn');
  const isLike = !!likeBtn;

  const btn = isLike ? likeBtn : dislikeBtn;
  const otherBtn = isLike
    ? btn.parentElement.querySelector('.dislike-btn')
    : btn.parentElement.querySelector('.like-btn');

  const postId = btn.dataset.id;
  const voterId = getOrCreateVoterId();

  try {
    const res = await fetch(`/api/vote/${contentType}/${postId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: isLike ? 'like' : 'dislike', voterId })
    });

    const result = await res.json();
    if (res.ok) {
      const countSpan = btn.querySelector('.count');
      const otherCountSpan = otherBtn?.querySelector('.count');
      const icon = btn.querySelector('i');
      const otherIcon = otherBtn?.querySelector('i');
      const voteKey = `vote_${postId}`;
      const previousVote = localStorage.getItem(voteKey);

      if (countSpan) countSpan.textContent = isLike ? result.likes : result.dislikes;
      if (otherCountSpan) otherCountSpan.textContent = isLike ? result.dislikes : result.likes;

      if (previousVote === (isLike ? 'like' : 'dislike')) {
        icon.className = 'bi ' + (isLike ? 'bi-hand-thumbs-up' : 'bi-hand-thumbs-down');
        localStorage.removeItem(voteKey);
      } else {
        icon.className = 'bi ' + (isLike ? 'bi-hand-thumbs-up-fill' : 'bi-hand-thumbs-down-fill');
        if (otherIcon) {
          otherIcon.className = 'bi ' + (isLike ? 'bi-hand-thumbs-down' : 'bi-hand-thumbs-up');
        }
        localStorage.setItem(voteKey, isLike ? 'like' : 'dislike');
      }
    }
  } catch (err) {
    console.error('Vote failed:', err);
  }
}
