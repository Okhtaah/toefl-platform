let currentPage = 1;
let totalPages = 45;
let materialId = 'demo-1';
let isBookmarked = false;

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    initMaterial();
});

function initMaterial() {
    const urlParams = new URLSearchParams(window.location.search);
    materialId = urlParams.get('id') || 'demo-1';
    
    // Simulate fetch from DB
    document.getElementById('material-title').textContent = "Official Guide to the TOEFL iBT";
    
    // Check saved state
    const savedState = JSON.parse(localStorage.getItem(`material_${materialId}`) || '{}');
    if (savedState.lastPage && savedState.lastPage > 1) {
        document.getElementById('resume-alert').style.display = 'block';
        document.getElementById('resume-page').textContent = savedState.lastPage;
    }
    
    if (savedState.bookmarked) {
        isBookmarked = true;
        updateBookmarkUI();
    }
}

function changePage(delta) {
    currentPage += delta;
    if(currentPage < 1) currentPage = 1;
    if(currentPage > totalPages) currentPage = totalPages;
    
    document.getElementById('current-page').textContent = currentPage;
    
    // Save progress
    const savedState = JSON.parse(localStorage.getItem(`material_${materialId}`) || '{}');
    savedState.lastPage = currentPage;
    localStorage.setItem(`material_${materialId}`, JSON.stringify(savedState));
}

function resumeReading() {
    const savedState = JSON.parse(localStorage.getItem(`material_${materialId}`) || '{}');
    currentPage = savedState.lastPage;
    document.getElementById('current-page').textContent = currentPage;
    document.getElementById('resume-alert').style.display = 'none';
}

function toggleBookmark() {
    isBookmarked = !isBookmarked;
    const savedState = JSON.parse(localStorage.getItem(`material_${materialId}`) || '{}');
    savedState.bookmarked = isBookmarked;
    localStorage.setItem(`material_${materialId}`, JSON.stringify(savedState));
    
    updateBookmarkUI();
}

function updateBookmarkUI() {
    const btn = document.getElementById('btn-bookmark');
    if (isBookmarked) {
        btn.classList.remove('btn-outline');
        btn.classList.add('btn-primary');
        btn.innerHTML = '<i data-lucide="bookmark-check"></i> Bookmarked';
    } else {
        btn.classList.add('btn-outline');
        btn.classList.remove('btn-primary');
        btn.innerHTML = '<i data-lucide="bookmark"></i> Bookmark';
    }
    lucide.createIcons();
}
