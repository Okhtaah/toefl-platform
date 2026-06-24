document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
});

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
