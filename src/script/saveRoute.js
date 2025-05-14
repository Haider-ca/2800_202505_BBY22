(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const saveBtn = document.getElementById('btn-save-route');
    if (!saveBtn) return;

    let lastSavedGeometry = null;
    let isSaved = false;
    let lastSavedId = null;

    let toastEl = document.getElementById('save-toast');
    if (!toastEl) {
      const wrap = document.createElement('div');
      wrap.className = 'toast-container position-fixed top-50 start-50 translate-middle';
      wrap.innerHTML = `
        <div id="save-toast" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
          <div class="toast-header">
            <strong class="me-auto">PathPal</strong>
            <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
          </div>
          <div class="toast-body">...</div>
        </div>
      `;
      document.body.appendChild(wrap);
      toastEl = document.getElementById('save-toast');
    }

    const showToast = (message) => {
      toastEl.querySelector('.toast-body').textContent = message;
      new bootstrap.Toast(toastEl, {
        delay: 2500,
        autohide: true
      }).show();
    };

    saveBtn.addEventListener('click', async () => {
      if (!window.lastRouteGeoJSON || !window.currentProfile) {
        alert('No active route to save.');
        return;
      }

      const confirmText = isSaved
        ? 'Do you want to remove this route?'
        : 'Do you want to save this route?';

      const confirmed = await showSaveConfirmation(confirmText, isSaved ? 'Yes, Remove' : 'Yes, Save');
      if (!confirmed) return;

      if (!isSaved) {
        const payload = {
          name: 'Saved Route',
          description: '',
          profile: window.currentProfile,
          geometry: window.lastRouteGeoJSON.geometry
        };

        try {
          const res = await fetch('/api/routes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          if (!res.ok) {
            alert('Save failed');
            return;
          }

          const data = await res.json();
          lastSavedId = data._id;
          isSaved = true;
          updateSaveButton();
          showToast('Route saved successfully!');
          lastSavedGeometry = JSON.parse(JSON.stringify(window.lastRouteGeoJSON.geometry));
        } catch (err) {
          alert('Something went wrong while saving.');
        }

      } else {
        isSaved = false;
        lastSavedId = null;
        updateSaveButton();
        showToast('Route removed successfully!');
        lastSavedGeometry = null;

      }
    });

        document.getElementById('dir-clear')?.addEventListener('click', () => {
      if (isSaved) {
        isSaved = false;
        lastSavedId = null;
        lastSavedGeometry = null;
        updateSaveButton();
        saveBtn.classList.remove('d-none'); 
      }
    });

    function updateSaveButton() {
      if (isSaved) {
        saveBtn.textContent = '✅ Saved';
        saveBtn.classList.remove('btn-outline-success');
        saveBtn.classList.add('btn-primary');
      } else {
        saveBtn.textContent = '📌 Save This Route';
        saveBtn.classList.remove('btn-primary');
        saveBtn.classList.add('btn-outline-light');
      }
    }
  

      document.getElementById('dir-go')?.addEventListener('click', () => {
      // small delay so window.lastRouteGeoJSON has updated
      setTimeout(() => {
        const g = window.lastRouteGeoJSON?.geometry;
        if (lastSavedGeometry && g && JSON.stringify(g) !== JSON.stringify(lastSavedGeometry)) {
          isSaved           = false;
          lastSavedId       = null;
          lastSavedGeometry = null;
          updateSaveButton();
        }
      }, 500);
    });
  });

  function showSaveConfirmation(message, yesText = 'Yes') {
    return new Promise(resolve => {
      const modal = document.createElement('div');
      modal.className = 'modal fade';
      modal.tabIndex = -1;
      modal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Confirm Action</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <p>${message}</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="button" class="btn btn-primary" id="btn-confirm-action">${yesText}</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      const bsModal = new bootstrap.Modal(modal);
      bsModal.show();

      modal.querySelector('#btn-confirm-action').addEventListener('click', () => {
        bsModal.hide();
        modal.remove();
        resolve(true);
      });

      modal.addEventListener('hidden.bs.modal', () => {
        modal.remove();
        resolve(false);
      });
    });
  }
})();
