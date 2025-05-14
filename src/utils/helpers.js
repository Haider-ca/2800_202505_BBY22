export function formatDate(dateString) {
    const d = new Date(dateString);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function getOrCreateVoterId() {
    let id = localStorage.getItem('voterId');
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem('voterId', id);
    }
    return id;
}
