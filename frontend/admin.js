document.addEventListener('DOMContentLoaded', () => {
    if(!localStorage.getItem('token')) window.location.href = 'auth.html';
    lucide.createIcons();
});

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.sidebar-link').forEach(el => el.classList.remove('active'));
    
    document.getElementById(`${tabId}-tab`).style.display = 'block';
    event.currentTarget.classList.add('active');

    if(tabId === 'users') fetchUsers();
    if(tabId === 'codes') fetchCodes();
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = 'auth.html';
}

async function fetchUsers() {
    try {
        const res = await fetch('/api/admin/users', {
            headers: { 'x-auth-token': localStorage.getItem('token') }
        });
        const users = await res.json();
        
        const tbody = document.getElementById('users-table-body');
        tbody.innerHTML = users.map(u => `
            <tr>
                <td style="font-weight: 600;">${u.full_name}</td>
                <td><span class="status-badge ${u.role === 'ADMIN' ? 'status-graded' : 'status-pending'}">${u.role}</span></td>
                <td>
                    <button class="btn btn-outline" style="padding: 6px 12px; font-size: 13px;" onclick="toggleRole('${u.id}', '${u.role === 'ADMIN' ? 'STUDENT' : 'ADMIN'}')">
                        Make ${u.role === 'ADMIN' ? 'Student' : 'Admin'}
                    </button>
                </td>
            </tr>
        `).join('');
    } catch(e) {
        console.error(e);
    }
}

async function toggleRole(id, newRole) {
    await fetch(`/api/admin/users/${id}/role`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'x-auth-token': localStorage.getItem('token') 
        },
        body: JSON.stringify({ newRole })
    });
    fetchUsers();
}

async function createCourse() {
    const title = document.getElementById('build-title').value;
    const type = document.getElementById('build-type').value;
    const timeLimit = document.getElementById('build-time').value;
    const alertTime = document.getElementById('build-alert').value;
    
    await fetch(`/api/admin/courses`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'x-auth-token': localStorage.getItem('token') 
        },
        body: JSON.stringify({ title, course_type: type, timeLimit, alertTime })
    });
    alert("Course Block created successfully in DB!");
}

async function fetchCodes() {
    try {
        const res = await fetch('/api/admin/codes', {
            headers: { 'x-auth-token': localStorage.getItem('token') }
        });
        const codes = await res.json();
        
        const tbody = document.getElementById('codes-table-body');
        if(codes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">No access codes generated yet.</td></tr>';
            return;
        }
        tbody.innerHTML = codes.map(c => `
            <tr>
                <td style="font-weight: 600;">${c.code}</td>
                <td>${c.target_type}</td>
                <td>
                    <div style="background: var(--bg-main); border: 1px solid var(--border-color); border-radius: 4px; height: 8px; width: 100%; overflow: hidden; margin-top: 4px;">
                        <div style="background: var(--primary-color); height: 100%; width: ${(c.current_uses / c.max_uses) * 100}%;"></div>
                    </div>
                    <span style="font-size: 12px; color: var(--text-muted);">${c.current_uses} / ${c.max_uses} uses</span>
                </td>
                <td style="color: var(--text-muted); font-size: 13px;">${new Date(c.created_at).toLocaleDateString()}</td>
            </tr>
        `).join('');
    } catch(e) {
        console.error(e);
    }
}

async function createAccessCode() {
    const code = document.getElementById('code-phrase').value;
    const target_type = document.getElementById('code-type').value;
    const target_id = document.getElementById('code-target').value;
    const max_uses = document.getElementById('code-uses').value;
    
    try {
        const res = await fetch(`/api/admin/codes`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('token') 
            },
            body: JSON.stringify({ code, target_type, target_id, max_uses })
        });
        if(res.ok) {
            fetchCodes();
            document.getElementById('code-phrase').value = '';
            document.getElementById('code-target').value = '';
        } else {
            alert('Failed to create code. Check if UUID is valid.');
        }
    } catch(e) {
        console.error(e);
    }
}

async function importBulkQuestions() {
    const taskId = document.getElementById('bulk-task-id').value;
    const jsonStr = document.getElementById('bulk-json').value;
    
    if(!taskId || !jsonStr) {
        alert("Please provide both Task ID and JSON data.");
        return;
    }
    
    try {
        const questions = JSON.parse(jsonStr);
        const res = await fetch(`/api/admin/questions/bulk`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('token') 
            },
            body: JSON.stringify({ task_id: taskId, questions })
        });
        
        if(res.ok) {
            alert('Bulk import successful!');
            document.getElementById('bulk-json').value = '';
            fetchQuestions();
        } else {
            alert('Failed to import.');
        }
    } catch(e) {
        alert("Invalid JSON format.");
        console.error(e);
    }
}

async function fetchQuestions() {
    const search = document.getElementById('q-search').value;
    const type = document.getElementById('q-filter').value;
    
    try {
        const res = await fetch(`/api/admin/questions?search=${encodeURIComponent(search)}&type=${type}`, {
            headers: { 'x-auth-token': localStorage.getItem('token') }
        });
        const questions = await res.json();
        
        const list = document.getElementById('questions-list');
        list.innerHTML = questions.map(q => `
            <div style="background-color: var(--bg-secondary); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-color);">
                <div style="font-size: 12px; color: var(--primary-color); font-weight: 600; margin-bottom: 4px;">${q.task_type}</div>
                <div style="font-weight: 600;">${q.prompt}</div>
            </div>
        `).join('');
    } catch(e) {
        console.error(e);
    }
}

function openGrading(type) {
    document.getElementById('grading-view').classList.add('active');
    
    // Hide both works initially
    document.getElementById('work-writing').style.display = 'none';
    document.getElementById('work-speaking').style.display = 'none';

    // Show correct work and update headers based on mock row clicked
    if (type === 'writing') {
        document.getElementById('grade-student-name').textContent = 'Alex Johnson';
        document.getElementById('grade-task-type').textContent = 'Writing: Academic Discussion';
        document.getElementById('work-writing').style.display = 'block';
    } else if (type === 'speaking') {
        document.getElementById('grade-student-name').textContent = 'Maria Garcia';
        document.getElementById('grade-task-type').textContent = 'Speaking: Independent Speaking';
        document.getElementById('work-speaking').style.display = 'block';
    }
}

function closeGrading() {
    document.getElementById('grading-view').classList.remove('active');
}

function submitGrade() {
    // In reality, this would POST the grade to the backend /api/grades
    const btn = document.querySelector('.eval-card .btn-primary');
    const originalText = btn.innerHTML;
    
    btn.innerHTML = '<i class="lucide lucide-loader" style="width: 18px; animation: spin 1s linear infinite;"></i> Saving...';
    btn.style.opacity = '0.7';
    
    setTimeout(() => {
        alert("Grade submitted successfully! The student's results page will now reflect the final score.");
        btn.innerHTML = originalText;
        btn.style.opacity = '1';
        closeGrading();
        
        // Remove the row from the table for visual effect
        const tbody = document.querySelector('.submissions-table tbody');
        if(tbody.children.length > 0) {
            tbody.removeChild(tbody.children[0]); 
        }
        
    }, 1000);
}

// Keyframes for loader spin dynamically added since lucide doesn't animate by default
const style = document.createElement('style');
style.innerHTML = `
    @keyframes spin { 100% { transform: rotate(360deg); } }
`;
document.head.appendChild(style);
