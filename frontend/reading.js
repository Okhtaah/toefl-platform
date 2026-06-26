let questions = [];
let currentIndex = 0;
let answers = {}; 
let timeLimit = 0;
let alertLimit = 0;
let timerInterval;
let courseId;

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    fetchExamData();
});

async function fetchExamData() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        courseId = urlParams.get('course_id') || 1;
        const token = localStorage.getItem('token');
        
        const res = await fetch(`/api/exams/${courseId}`, {
            headers: { 'x-auth-token': token }
        });
        
        if(!res.ok) throw new Error('Failed to load exam data');
        
        const data = await res.json();
        const task = data.tasks[0]; 
        
        document.getElementById('pre-test-title').textContent = data.title;
        document.getElementById('pre-test-time').textContent = Math.floor(task.time_limit_seconds / 60);
        document.getElementById('pre-test-alert').textContent = task.alert_time_seconds ? Math.floor(task.alert_time_seconds / 60) : '--';
        
        timeLimit = task.time_limit_seconds;
        alertLimit = task.alert_time_seconds;
        questions = task.questions;
        
        document.getElementById('passage-title').textContent = task.title;
        document.getElementById('passage-content').innerHTML = `<p>${task.passage}</p>`;
        document.getElementById('total-q-num').textContent = questions.length;
        
        const startBtn = document.getElementById('start-exam-btn');
        
        // Check local storage for saved state
        const savedState = JSON.parse(localStorage.getItem(`exam_state_${courseId}`) || 'null');
        if (savedState) {
            startBtn.textContent = 'Resume Exam';
            answers = savedState.answers || {};
            currentIndex = savedState.currentIndex || 0;
            timeLimit = savedState.timeLeft; // override with remaining
        } else {
            startBtn.textContent = 'Start Exam';
        }
        
        startBtn.disabled = false;
        
    } catch(err) {
        console.error(err);
        document.getElementById('pre-test-title').textContent = "Error loading exam";
    }
}

function startActualExam() {
    document.getElementById('pre-test-screen').style.display = 'none';
    document.getElementById('exam-view').style.display = 'flex';
    renderGrid();
    renderQuestion();
    startTimer();
}

function renderGrid() {
    const grid = document.getElementById('question-grid');
    grid.innerHTML = questions.map((_, idx) => `
        <div id="grid-box-${idx}" onclick="jumpTo(${idx})" 
             style="width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border-radius: 4px; border: 1px solid var(--border-color); cursor: pointer; font-size: 12px; font-weight: 600; background-color: ${answers[idx] !== undefined ? 'var(--primary-color)' : 'transparent'}; color: ${answers[idx] !== undefined ? '#fff' : 'var(--text-main)'}; opacity: ${idx === currentIndex ? '0.7' : '1'};">
            ${idx + 1}
        </div>
    `).join('');
}

function startTimer() {
    let timeLeft = timeLimit;
    const display = document.getElementById('time-display');
    const timerElement = document.getElementById('exam-timer');
    
    timerInterval = setInterval(() => {
        timeLeft--;
        let minutes = Math.floor(timeLeft / 60);
        let seconds = timeLeft % 60;
        
        display.textContent = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        
        // Save state every second
        localStorage.setItem(`exam_state_${courseId}`, JSON.stringify({
            answers,
            currentIndex,
            timeLeft
        }));
        
        if (alertLimit && timeLeft <= alertLimit && timeLeft > alertLimit - 2) {
            timerElement.style.color = '#ef4444';
            alert(`You have ${Math.floor(alertLimit / 60)} minutes remaining!`);
        }
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            alert("Time's up! Automatically submitting the Reading section.");
            submitExam();
        }
    }, 1000);
}

function renderQuestion() {
    const q = questions[currentIndex];
    const container = document.getElementById('question-container');
    document.getElementById('current-q-num').textContent = currentIndex + 1;
    
    let html = `<div class="question-prompt">${q.prompt}</div>`;
    
    // Check if it's MCQ or Fill in Blanks based on presence of options
    // Assuming PRD "Complete the Words" has no options
    if (q.options && q.options.length > 0) {
        q.options.forEach((opt, index) => {
            const isSelected = answers[currentIndex] === index ? 'checked' : '';
            html += `
                <label class="option hover-scale" style="transition: border-color 0.2s, background-color 0.2s;">
                    <input type="radio" name="q${currentIndex}" value="${index}" ${isSelected} onclick="selectAnswer(${index})">
                    ${opt}
                </label>
            `;
        });
    } else {
        // Fill in Blanks
        const currentAns = answers[currentIndex] || '';
        html += `
            <div style="margin-top: 1rem;">
                <input type="text" id="blank-input" value="${currentAns}" oninput="selectTextAnswer(this.value)" placeholder="Type your exact answer here..." style="width: 100%; padding: 12px; font-size: 16px; border: 2px solid var(--border-color); border-radius: 8px; background-color: var(--bg-main); color: var(--text-main);">
            </div>
        `;
    }
    
    container.innerHTML = html;
    renderGrid(); // update grid colors
    updateButtons();
}

function selectAnswer(index) {
    answers[currentIndex] = index;
    renderGrid(); // Update immediately to turn box green
}

function selectTextAnswer(value) {
    answers[currentIndex] = value;
    renderGrid(); // Update immediately to turn box green
}

function navigate(direction) {
    currentIndex += direction;
    renderQuestion();
}

function jumpTo(index) {
    currentIndex = index;
    renderQuestion();
}

function updateButtons() {
    document.getElementById('btn-back').disabled = currentIndex === 0;
    const nextBtn = document.getElementById('btn-next');
    
    if (currentIndex === questions.length - 1) {
        nextBtn.innerHTML = 'Submit <i data-lucide="check" style="width: 18px;"></i>';
        nextBtn.onclick = submitExam;
    } else {
        nextBtn.innerHTML = 'Next <i data-lucide="arrow-right" style="width: 18px;"></i>';
        nextBtn.onclick = () => navigate(1);
    }
    lucide.createIcons();
}

function submitExam() {
    clearInterval(timerInterval);
    localStorage.removeItem(`exam_state_${courseId}`);
    // In reality: POST /api/exams/submit
    
    document.body.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background-color: var(--bg-main); color: var(--text-main); font-family: var(--font-main);">
            <i data-lucide="check-circle" style="width: 64px; height: 64px; color: #10b981; margin-bottom: 1rem;"></i>
            <h1 style="margin-bottom: 1rem;">Reading Section Completed!</h1>
            <p style="color: var(--text-muted); margin-bottom: 2rem;">Saving answers securely...</p>
            <a href="dashboard.html" class="btn btn-primary">Return to Dashboard</a>
        </div>
    `;
    lucide.createIcons();
}

function quitExam() {
    if(confirm("Are you sure you want to quit? Your progress is saved and the timer is paused.")) {
        clearInterval(timerInterval);
        window.location.href = "dashboard.html";
    }
}
