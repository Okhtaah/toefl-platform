document.addEventListener('DOMContentLoaded', () => {
    if(!localStorage.getItem('token')) {
        window.location.href = 'auth.html';
        return;
    }
    lucide.createIcons();
    fetchDashboardData();
});

async function fetchDashboardData() {
    try {
        const token = localStorage.getItem('token');
        
        // Fetch User Progress
        const progressRes = await fetch('/api/user/progress', {
            headers: { 'x-auth-token': token }
        });
        const progress = await progressRes.json();
        
        // Render Recent Scores (Last Test)
        const scoresContainer = document.getElementById('recent-scores');
        if (progress.attempts && progress.attempts.length > 0) {
            const a = progress.attempts[0]; // Just show the last one
            scoresContainer.innerHTML = `
                <div style="margin-top: 1rem;">
                    <a href="results.html?attempt_id=${a.id}" style="text-decoration: none; color: inherit;">
                        <div style="display: flex; justify-content: space-between; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; transition: background-color 0.2s;">
                            <div>
                                <div style="font-weight: 600;">${a.title || 'Practice Test'}</div>
                                <div style="font-size: 12px; color: ${a.status === 'GRADED' ? '#10b981' : '#f59e0b'}; margin-top: 4px;">${a.status.replace('_', ' ')}</div>
                            </div>
                            <div style="font-weight: 700; font-size: 18px; color: var(--primary-color);">
                                ${a.total_score ? a.total_score : '--'}<span style="font-size: 12px; color: var(--text-muted);">/120</span>
                            </div>
                        </div>
                    </a>
                </div>
            `;
        } else {
            scoresContainer.innerHTML = `<p style="color: var(--text-muted); font-size: 14px;">No tests taken yet.</p>`;
        }

        // Fake notifications since we don't have a messages route yet, but user asked for it
        document.getElementById('notif-count').textContent = '1 Unread';
        document.getElementById('notifications-list').innerHTML = `
            <div style="padding: 10px; border-bottom: 1px solid var(--border-color); font-size: 14px;">
                <strong style="color: var(--primary-color);">System:</strong> Welcome to your new TOEFL Dashboard!
            </div>
        `;

        // Render Unlocked Access
        document.getElementById('access-list').innerHTML = `
            <li style="margin-bottom: 0.8rem; display: flex; align-items: center; gap: 8px;">
                <i data-lucide="check-circle-2" style="color: #10b981; width: 18px;"></i> Free Content
            </li>
        `;
        lucide.createIcons();

        // Fetch Available Courses
        const coursesRes = await fetch('/api/user/courses', {
            headers: { 'x-auth-token': token }
        });
        const courses = await coursesRes.json();
        
        const mockExams = courses.filter(c => c.course_type === 'MOCK_EXAM');
        const practices = courses.filter(c => c.course_type === 'PRACTICE_SECTION');
        
        // Render Quick Actions (Dynamic links)
        const actionsContainer = document.getElementById('quick-actions');
        
        let html = '';
        if (mockExams.length > 0) {
            html += `<a href="reading.html?course_id=${mockExams[0].id}" class="btn btn-primary full-width" style="text-decoration: none;">Start ${mockExams[0].title}</a>`;
        }
        if (practices.length > 0) {
            html += `<a href="reading.html?course_id=${practices[0].id}" class="btn btn-secondary full-width" style="text-decoration: none;">Practice: ${practices[0].title}</a>`;
        }
        
        if(html) {
            actionsContainer.innerHTML = html;
        } else {
            actionsContainer.innerHTML = '<p style="color: var(--text-muted); font-size: 14px;">No active exams found.</p>';
        }

    } catch(err) {
        console.error(err);
    }
}
