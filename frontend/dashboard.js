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

        // Decode JWT to get user name quickly (no extra round-trip)
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const name = payload.user?.full_name || payload.user?.email || 'Student';
            const nameEl = document.getElementById('user-email-display');
            if (nameEl) nameEl.textContent = name.split(' ')[0]; // First name
        } catch(e) { /* ignore decode errors */ }
        
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

        // Fetch unread messages count
        try {
            const msgsRes = await fetch('/api/messages', { headers: { 'x-auth-token': token } });
            if (msgsRes.ok) {
                const msgs = await msgsRes.json();
                const payload = JSON.parse(atob(token.split('.')[1]));
                const myId = payload.user?.id;
                const unread = msgs.filter(m => m.sender_id !== myId).length;
                document.getElementById('notif-count').textContent = unread > 0 ? `${unread} Unread` : '0 Unread';
                const latestMsg = msgs[msgs.length - 1];
                document.getElementById('notifications-list').innerHTML = msgs.length > 0 ? `
                    <a href="messages.html" style="text-decoration: none; color: inherit;">
                        <div style="padding: 10px; border-bottom: 1px solid var(--border-color); font-size: 14px; display: flex; align-items: center; gap: 8px;">
                            <i data-lucide="message-circle" style="color: var(--primary-color); width: 16px;"></i>
                            <span><strong>Admin:</strong> ${latestMsg.content.substring(0, 60)}${latestMsg.content.length > 60 ? '...' : ''}</span>
                        </div>
                    </a>
                ` : `<div style="padding: 10px; font-size: 14px; color: var(--text-muted);">No messages yet. <a href="messages.html">Start a conversation</a>.</div>`;
            } else {
                document.getElementById('notifications-list').innerHTML = `<div style="padding: 10px; font-size: 14px;"><strong style="color: var(--primary-color);">System:</strong> Welcome to your TOEFL Dashboard! <a href="messages.html">Message your instructor →</a></div>`;
            }
        } catch(e) {
            document.getElementById('notifications-list').innerHTML = `<div style="padding: 10px; font-size: 14px;"><strong style="color: var(--primary-color);">System:</strong> Welcome to your TOEFL Dashboard!</div>`;
        }
        lucide.createIcons();

        // Fetch Available Courses
        const coursesRes = await fetch('/api/user/courses', {
            headers: { 'x-auth-token': token }
        });
        const courses = await coursesRes.json();
        
        const courseContainer = document.getElementById('course-cards-container');
        if(courses.length > 0) {
            courseContainer.innerHTML = courses.map(c => `
                <div class="card shadow-sm hover-scale group" style="display: flex; flex-direction: column; padding: 0; overflow: hidden; border-radius: 1rem;">
                    <div class="bg-gradient-primary" style="height: 120px; position: relative;">
                        <div class="floating-badge" style="background-color: rgba(255,255,255,0.8); color: var(--text-main);">Full Course</div>
                    </div>
                    <div style="padding: 1.5rem; flex: 1; display: flex; flex-direction: column;">
                        <h3 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem;">${c.title}</h3>
                        <p style="color: var(--text-muted); margin-bottom: 1.5rem; font-size: 0.875rem;">Master the TOEFL with our comprehensive preparation material.</p>
                        
                        <div style="margin-top: auto; display: flex; flex-direction: column; gap: 1rem;">
                            <div style="display: flex; justify-content: space-between; font-size: 0.875rem; font-weight: 600;">
                                <span>Progress</span>
                                <span>0%</span>
                            </div>
                            <button class="btn btn-primary shadow-sm hover-scale" onclick="window.location.href='reading.html?course_id=${c.id}'" style="width: 100%; border-radius: 0.75rem; justify-content: center;">
                                <i data-lucide="play-circle"></i> Continue Learning
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        } else {
            courseContainer.innerHTML = `<div style="padding: 3rem; text-align: center; border: 2px dashed var(--border-color); border-radius: 1rem; color: var(--text-muted);">No courses available yet.</div>`;
        }
        
        lucide.createIcons();
    } catch (err) {
        console.error(err);
    }
}
