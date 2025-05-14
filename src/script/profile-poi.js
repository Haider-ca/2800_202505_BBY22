// Function to load and display user POIs with pagination, search, sort, and filter
export async function loadUserPOIs() {
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
        console.log('Profile Data:', profileData); // Debug: In toàn bộ profileData
        const userId = profileData._id;
        if (!userId) {
            throw new Error('User ID not found in profile data');
        }
        console.log('User ID:', userId); // Debug: In userId

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
        console.log('POIs:', pois); // Debug: In kết quả POIs

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
            card.className = 'card mb-3 position-relative'; // Thêm position-relative để định vị nút
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

        // Thêm sự kiện cho nút Edit
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const poiId = e.currentTarget.dataset.id;
                // Lấy thông tin hiện tại của POI để điền vào modal
                const poi = pois.find(p => p._id === poiId);
                if (poi) {
                    // Tạo modal để chỉnh sửa
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
                                            <label for="description-${poiId}" class="form-label">Description</label>
                                            <textarea class="form-control" id="description-${poiId}" rows="3">${poi.description || ''}</textarea>
                                        </div>
                                        <div class="mb-3">
                                            <label for="imageUrl-${poiId}" class="form-label">Image URL</label>
                                            <input type="text" class="form-control" id="imageUrl-${poiId}" value="${poi.imageUrl || ''}">
                                        </div>
                                        <button type="submit" class="btn btn-primary">Save Changes</button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    `;
                    document.body.appendChild(modal);

                    // Khởi tạo Bootstrap modal
                    const bootstrapModal = new bootstrap.Modal(modal);
                    bootstrapModal.show();

                    // Xử lý submit form
                    document.getElementById(`editForm-${poiId}`).addEventListener('submit', async (event) => {
                        event.preventDefault();
                        const newDescription = document.getElementById(`description-${poiId}`).value;
                        const newImageUrl = document.getElementById(`imageUrl-${poiId}`).value;

                        try {
                            const response = await fetch(`/api/pois/${poiId}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    description: newDescription,
                                    imageUrl: newImageUrl
                                }),
                                credentials: 'include' // Đảm bảo gửi cookie/session
                            });

                            if (response.ok) {
                                console.log('POI updated successfully');
                                bootstrapModal.hide();
                                loadUserPOIs(); // Làm mới danh sách sau khi chỉnh sửa
                            } else {
                                throw new Error('Failed to update POI');
                            }
                        } catch (err) {
                            console.error('Error updating POI:', err);
                        }
                    });

                    // Xóa modal khi đóng
                    modal.addEventListener('hidden.bs.modal', () => {
                        modal.remove();
                    });
                }
            });
        });

        // Thêm sự kiện cho nút Delete (giữ nguyên placeholder)
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const poiId = e.currentTarget.dataset.id;
                console.log(`Delete POI with ID: ${poiId}`); // Placeholder logic
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