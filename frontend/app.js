// Initialize Lucide Icons
lucide.createIcons();

function applyTheme(theme) {
    const htmlEl = document.documentElement;
    htmlEl.setAttribute('data-theme', theme);
    localStorage.setItem('toefl-theme', theme);
    
    // Update Icon
    const btn = document.getElementById('theme-btn');
    if (btn) {
        btn.innerHTML = theme === 'dark' ? '<i data-lucide="sun"></i>' : '<i data-lucide="moon"></i>';
        lucide.createIcons();
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
}

// Ensure correct theme and icon on load
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('toefl-theme') || 'light';
    applyTheme(savedTheme);
});
