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
}

async function fetchUsers() {
    try {
        const res = await fetch('http://localhost:5000/api/admin/users', {
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
    await fetch(`http://localhost:5000/api/admin/users/${id}/role`, {
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
    
    await fetch(`http://localhost:5000/api/admin/courses`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'x-auth-token': localStorage.getItem('token') 
        },
        body: JSON.stringify({ title, course_type: type })
    });
    alert("Course Block created successfully in DB!");
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
