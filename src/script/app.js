// src/script/app.js

document.addEventListener('DOMContentLoaded', () => {
  const contentText = document.querySelector('.content');
  if (!contentText) return;          // bail out if the element isn’t on this page
  contentText.textContent = "This is the content";
});
