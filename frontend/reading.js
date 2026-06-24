// Simulated Data for Reading Section
const questions = [
    {
        id: 1,
        type: 'mcq',
        prompt: 'According to paragraph 1, what made early deep-sea exploration impossible?',
        options: [
            'A lack of scientific interest in marine biology.',
            'The inability to build ships large enough to carry heavy equipment.',
            'Crushing pressure, total darkness, and freezing temperatures.',
            'The high cost of gasoline required for bathyscaphes.'
        ]
    },
    {
        id: 2,
        type: 'mcq',
        prompt: 'The word "rudimentary" in paragraph 1 is closest in meaning to:',
        options: [
            'Complex',
            'Basic',
            'Expensive',
            'Dangerous'
        ]
    },
    {
        id: 3,
        type: 'complete_words',
        prompt: 'Complete the sentence based on paragraph 2:',
        sentence: 'Unlike their manned predecessors, ROVs do not require heavy <input type="text" class="blank-input" data-answer="life-support" autocomplete="off"> systems, allowing them to remain submerged for days at a time.'
    }
];

let currentIndex = 0;
let timeRemaining = 18 * 60; // 18 minutes in seconds
let timerInterval;

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('total-q-num').textContent = questions.length;
    renderQuestion();
    startTimer();
});

function renderQuestion() {
    const q = questions[currentIndex];
    const container = document.getElementById('question-container');
    document.getElementById('current-q-num').textContent = currentIndex + 1;
    
    // Manage buttons
    document.getElementById('btn-back').disabled = currentIndex === 0;
    
    const btnNext = document.getElementById('btn-next');
    if (currentIndex === questions.length - 1) {
        btnNext.innerHTML = 'Submit Section <i data-lucide="check" style="width: 18px;"></i>';
        btnNext.classList.replace('btn-primary', 'btn-outline'); // Make it look different for submit
    } else {
        btnNext.innerHTML = 'Next <i data-lucide="arrow-right" style="width: 18px;"></i>';
        btnNext.classList.replace('btn-outline', 'btn-primary');
    }

    if (q.type === 'mcq') {
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

        container.innerHTML = `
            <h3 style="margin-bottom: 1.5rem; font-size: 20px;">${q.prompt}</h3>
            <ul class="options-list">
                ${optionsHtml}
            </ul>
        `;
    } else if (q.type === 'complete_words') {
        container.innerHTML = `
            <h3 style="margin-bottom: 1.5rem; font-size: 20px;">Task 1: Complete the Words</h3>
            <p style="margin-bottom: 1rem; color: var(--text-muted);">${q.prompt}</p>
            <div class="blanks-sentence" style="padding: 2rem; background-color: var(--bg-main); border-radius: 8px; border: 1px solid var(--border-color);">
                ${q.sentence}
            </div>
        `;
    }
    
    lucide.createIcons();
}

function navigate(direction) {
    if (direction === 1 && currentIndex === questions.length - 1) {
        submitSection();
        return;
    }
    
    currentIndex += direction;
    if (currentIndex < 0) currentIndex = 0;
    if (currentIndex >= questions.length) currentIndex = questions.length - 1;
    
    renderQuestion();
}

function startTimer() {
    const display = document.getElementById('time-display');
    const timerDiv = document.getElementById('exam-timer');
    
    timerInterval = setInterval(() => {
        timeRemaining--;
        
        let minutes = Math.floor(timeRemaining / 60);
        let seconds = timeRemaining % 60;
        
        display.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        
        if (timeRemaining <= 60) {
            timerDiv.style.background = 'rgba(229, 62, 62, 0.3)';
            timerDiv.style.animation = 'pulse 1s infinite';
        }
        
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            submitSection(true);
        }
    }, 1000);
}

function submitSection(autoSubmit = false) {
    clearInterval(timerInterval);
    const msg = autoSubmit ? "Time is up! Section auto-submitted." : "Reading section submitted successfully!";
    
    // In real app, collect answers and POST to backend here.
    
    document.body.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background-color: var(--bg-main); color: var(--text-main); font-family: var(--font-main);">
            <i data-lucide="check-circle" style="width: 64px; height: 64px; color: #10b981; margin-bottom: 1rem;"></i>
            <h1 style="margin-bottom: 1rem;">${msg}</h1>
            <p style="color: var(--text-muted); margin-bottom: 2rem;">Moving you to the Listening Section...</p>
            <a href="listening.html" class="btn btn-primary">Continue to Listening</a>
        </div>
    `;
    lucide.createIcons();
}

function quitExam() {
    if(confirm("Are you sure you want to quit? Your progress will NOT be saved.")) {
        window.location.href = "dashboard.html";
    }
}
