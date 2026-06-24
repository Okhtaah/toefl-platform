const questions = [
    {
        id: 1,
        type: 'conversation',
        prompt: 'Why does the student go to the registrar\'s office?',
        options: [
            'To change her major to biology.',
            'To drop a class she is struggling with.',
            'To request a copy of her official transcript.',
            'To clarify a mistake on her tuition bill.'
        ]
    },
    {
        id: 2,
        type: 'conversation',
        prompt: 'What does the registrar imply about the late fee?',
        options: [
            'It cannot be waived under any circumstances.',
            'It will be waived if the student fills out a specific form.',
            'The student is not actually responsible for it.',
            'The fee increases every week it goes unpaid.'
        ]
    }
];

let currentIndex = 0;
let answerTimeLimit = 20; // 20 seconds to answer per question
let answerTimerInterval;

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('total-q-num').textContent = questions.length;
});

function startAudio() {
    const btn = document.getElementById('start-audio-btn');
    const waves = document.getElementById('waves');
    
    btn.style.display = 'none';
    waves.classList.remove('audio-paused');
    
    // Simulate audio playing for 5 seconds (Instead of real audio for mock)
    setTimeout(() => {
        waves.classList.add('audio-paused');
        document.getElementById('audio-player').style.display = 'none';
        showQuestion();
    }, 5000); 
}

function showQuestion() {
    const q = questions[currentIndex];
    const container = document.getElementById('question-card');
    
    document.getElementById('current-q-num').textContent = currentIndex + 1;
    document.getElementById('exam-timer').style.display = 'flex';
    
    let optionsHtml = q.options.map((opt, i) => `
        <li class="option-item">
            <input type="radio" name="q${q.id}" id="opt${i}" value="${i}" style="display: none;">
            <label class="option-label" for="opt${i}">
                <div style="width: 24px; height: 24px; border-radius: 50%; border: 1px solid var(--text-muted); display: flex; align-items: center; justify-content: center; font-size: 12px; flex-shrink: 0;">
                    ${String.fromCharCode(65 + i)}
                </div>
                ${opt}
            </label>
        </li>
    `).join('');

    const isLast = currentIndex === questions.length - 1;

    container.innerHTML = `
        <h3 style="margin-bottom: 1.5rem; font-size: 20px;">${q.prompt}</h3>
        <ul class="options-list">
            ${optionsHtml}
        </ul>
        <div style="display: flex; justify-content: flex-end; margin-top: 2rem;">
            <button class="btn btn-primary" onclick="nextQuestion()">
                ${isLast ? 'Submit Section <i data-lucide="check" style="width: 18px;"></i>' : 'Next Question <i data-lucide="arrow-right" style="width: 18px;"></i>'}
            </button>
        </div>
    `;
    
    container.style.display = 'block';
    lucide.createIcons();
    
    startAnswerTimer();
}

function nextQuestion() {
    clearInterval(answerTimerInterval);
    
    if (currentIndex === questions.length - 1) {
        submitSection();
        return;
    }
    
    currentIndex++;
    showQuestion();
}

function startAnswerTimer() {
    let timeLeft = answerTimeLimit;
    const display = document.getElementById('time-display');
    const timerDiv = document.getElementById('exam-timer');
    
    timerDiv.style.background = 'rgba(229, 62, 62, 0.1)';
    timerDiv.style.animation = 'none';
    display.textContent = `00:${timeLeft}`;
    
    answerTimerInterval = setInterval(() => {
        timeLeft--;
        display.textContent = `00:${timeLeft < 10 ? '0' : ''}${timeLeft}`;
        
        if (timeLeft <= 5) {
            timerDiv.style.background = 'rgba(229, 62, 62, 0.3)';
            timerDiv.style.animation = 'pulse 1s infinite';
        }
        
        if (timeLeft <= 0) {
            clearInterval(answerTimerInterval);
            nextQuestion(); // Auto-advance when time is up
        }
    }, 1000);
}

function submitSection() {
    document.body.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background-color: var(--bg-main); color: var(--text-main); font-family: var(--font-main);">
            <i data-lucide="check-circle" style="width: 64px; height: 64px; color: #10b981; margin-bottom: 1rem;"></i>
            <h1 style="margin-bottom: 1rem;">Listening Section Completed!</h1>
            <p style="color: var(--text-muted); margin-bottom: 2rem;">Moving you to the Writing Section...</p>
            <a href="dashboard.html" class="btn btn-primary">Return to Dashboard</a>
        </div>
    `;
    lucide.createIcons();
}

function quitExam() {
    if(confirm("Are you sure you want to quit? Your progress will NOT be saved.")) {
        window.location.href = "dashboard.html";
    }
}
