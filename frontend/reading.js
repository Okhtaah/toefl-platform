let questions = [];
let currentIndex = 0;
let answers = {}; 
let timeLimit = 0;
let alertLimit = 0;
let timerInterval;

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    fetchExamData();
});

async function fetchExamData() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const courseId = urlParams.get('course_id') || 1; // Default to 1 if not provided
        const token = localStorage.getItem('token');
        
        const res = await fetch(`http://localhost:5000/api/exams/${courseId}`, {
            headers: { 'x-auth-token': token }
        });
        
        if(!res.ok) throw new Error('Failed to load exam data');
        
        const data = await res.json();
        const task = data.tasks[0]; // Assuming 1 task for simplicity right now
        
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
        startBtn.textContent = 'Start Exam';
        startBtn.disabled = false;
        
    } catch(err) {
        console.error(err);
        document.getElementById('pre-test-title').textContent = "Error loading exam";
    }
}

function startActualExam() {
    document.getElementById('pre-test-screen').style.display = 'none';
    document.getElementById('exam-view').style.display = 'flex';
    renderQuestion();
    startTimer();
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
        
        // Alert time logic
        if (alertLimit && timeLeft <= alertLimit && timeLeft > alertLimit - 2) {
            timerElement.style.color = '#ef4444'; // turn red
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
    
    q.options.forEach((opt, index) => {
        const isSelected = answers[currentIndex] === index ? 'checked' : '';
        html += `
            <label class="option">
                <input type="radio" name="q${currentIndex}" value="${index}" ${isSelected} onclick="selectAnswer(${index})">
                ${opt}
            </label>
        `;
    });
    
    container.innerHTML = html;
    updateButtons();
}

function selectAnswer(index) {
    answers[currentIndex] = index;
}

function navigate(direction) {
    currentIndex += direction;
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
    // In reality: POST /api/exams/submit
    
    document.body.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background-color: var(--bg-main); color: var(--text-main); font-family: var(--font-main);">
            <i data-lucide="check-circle" style="width: 64px; height: 64px; color: #10b981; margin-bottom: 1rem;"></i>
            <h1 style="margin-bottom: 1rem;">Reading Section Completed!</h1>
            <p style="color: var(--text-muted); margin-bottom: 2rem;">Moving you to the Listening Section...</p>
            <a href="listening.html" class="btn btn-primary">Start Listening Section</a>
        </div>
    `;
    lucide.createIcons();
}

function quitExam() {
    if(confirm("Are you sure you want to quit? Your progress will NOT be saved.")) {
        window.location.href = "dashboard.html";
    }
}
