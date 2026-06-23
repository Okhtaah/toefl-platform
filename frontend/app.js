// Initialize Lucide Icons
lucide.createIcons();

function toggleTheme() {
    const htmlEl = document.documentElement;
    const currentTheme = htmlEl.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    htmlEl.setAttribute('data-theme', newTheme);
    
    // Update Icon
    const btn = document.getElementById('theme-btn');
    if (btn) {
        if (newTheme === 'dark') {
            btn.innerHTML = '<i data-lucide="sun"></i>';
        } else {
            btn.innerHTML = '<i data-lucide="moon"></i>';
        }
        lucide.createIcons();
    }
}

// Ensure correct icon on load based on theme
document.addEventListener('DOMContentLoaded', () => {
    const htmlEl = document.documentElement;
    const theme = htmlEl.getAttribute('data-theme');
    const btn = document.getElementById('theme-btn');
    if(btn) {
        btn.innerHTML = theme === 'dark' ? '<i data-lucide="sun"></i>' : '<i data-lucide="moon"></i>';
        lucide.createIcons();
    }
});
