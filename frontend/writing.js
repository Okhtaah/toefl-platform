const tasks = [
    {
        id: 1,
        type: 'drag-drop',
        title: 'Task 1: Build a Sentence',
        instruction: 'Drag and drop the words from the bank into the box below to form a grammatically correct sentence.',
        time: 410, // 6m 50s
        words: ['fox', 'The', 'brown', 'quick', 'jumps', 'over', 'dog', 'lazy', 'the']
    },
    {
        id: 2,
        type: 'email',
        title: 'Task 2: Write an Email',
        instruction: 'You have received a bill with an incorrect late fee. Write an email to the registrar explaining the issue and asking for a correction.',
        time: 420 // 7m
    },
    {
        id: 3,
        type: 'forum',
        title: 'Task 3: Academic Discussion',
        instruction: 'Read the professor\'s prompt and the student replies, then contribute your own opinion to the discussion.',
        time: 600 // 10m
    }
];

let currentTaskIndex = 0;
let timeRemaining = tasks[currentTaskIndex].time;
let timerInterval;

document.addEventListener('DOMContentLoaded', () => {
    renderTask();
});

function renderTask() {
    clearInterval(timerInterval);
    const task = tasks[currentTaskIndex];
    timeRemaining = task.time;
    
    document.getElementById('task-subtitle').textContent = task.title;
    document.getElementById('task-title').textContent = task.instruction;
    
    const container = document.getElementById('task-content');
    
    if (task.type === 'drag-drop') {
        let wordsHtml = task.words.map(w => `<div class="draggable-word" draggable="true" ondragstart="drag(event)" id="word-${Math.random()}">${w}</div>`).join('');
        container.innerHTML = `
            <div class="drag-container">
                <p style="margin-bottom: 1rem; color: var(--text-muted);">Word Bank</p>
                <div class="word-bank" ondrop="drop(event)" ondragover="allowDrop(event)">
                    ${wordsHtml}
                </div>
                <p style="margin-bottom: 1rem; color: var(--text-muted);">Construct your sentence here:</p>
                <div class="drop-zone" id="sentence-zone" ondrop="drop(event)" ondragover="allowDrop(event)">
                </div>
            </div>
        `;
    } 
    else if (task.type === 'email' || task.type === 'forum') {
        let forumHtml = '';
        if(task.type === 'forum') {
            forumHtml = `
                <div class="forum-post">
                    <div class="avatar">Dr.</div>
                    <div class="post-content">
                        <strong>Dr. Smith</strong> (Professor)
                        <p style="margin-top: 8px;">Do you think university education should be free for everyone? Explain your reasoning.</p>
                    </div>
                </div>
                <div class="forum-post" style="margin-left: 2rem;">
                    <div class="avatar" style="background-color: #10b981;">A</div>
                    <div class="post-content">
                        <strong>Alex</strong> (Student)
                        <p style="margin-top: 8px;">I believe it should be free. Education is a fundamental right, not a privilege.</p>
                    </div>
                </div>
            `;
        }

        container.innerHTML = `
            ${forumHtml}
            <div class="editor-container">
                <div class="editor-toolbar">
                    <button class="editor-btn"><i data-lucide="bold" style="width: 16px;"></i></button>
                    <button class="editor-btn"><i data-lucide="italic" style="width: 16px;"></i></button>
                    <button class="editor-btn"><i data-lucide="list" style="width: 16px;"></i></button>
                </div>
                <textarea class="text-editor" id="essay-input" placeholder="Start typing your response here..."></textarea>
                <div class="word-count">Word count: <span id="word-count">0</span></div>
            </div>
        `;

        document.getElementById('essay-input').addEventListener('input', (e) => {
            const text = e.target.value.trim();
            const count = text ? text.split(/\s+/).length : 0;
            document.getElementById('word-count').textContent = count;
        });
    }

    lucide.createIcons();
    
    if (currentTaskIndex === tasks.length - 1) {
        document.getElementById('next-btn').innerHTML = 'Submit Writing Section <i data-lucide="check" style="width: 18px;"></i>';
    }

    startTimer();
}

function nextTask() {
    // Collect data (skipped for mock)
    
    if (currentTaskIndex === tasks.length - 1) {
        submitSection();
    } else {
        currentTaskIndex++;
        renderTask();
    }
}

// Timer Logic
function startTimer() {
    const display = document.getElementById('time-display');
    const timerDiv = document.getElementById('exam-timer');
    timerDiv.style.background = 'rgba(229, 62, 62, 0.1)';
    timerDiv.style.animation = 'none';

    updateDisplay();

    timerInterval = setInterval(() => {
        timeRemaining--;
        updateDisplay();
        
        if (timeRemaining <= 60) {
            timerDiv.style.background = 'rgba(229, 62, 62, 0.3)';
            timerDiv.style.animation = 'pulse 1s infinite';
        }
        
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            nextTask(); // Auto-advance
        }
    }, 1000);

    function updateDisplay() {
        let m = Math.floor(timeRemaining / 60);
        let s = timeRemaining % 60;
        display.textContent = `${m < 10 ? '0'+m : m}:${s < 10 ? '0'+s : s}`;
    }
}

// Drag and Drop Logic
function allowDrop(ev) { ev.preventDefault(); }
function drag(ev) { ev.dataTransfer.setData("text", ev.target.id); }
function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    const el = document.getElementById(data);
    // Ensure we only drop into the drop zones
    if (ev.target.classList.contains('word-bank') || ev.target.classList.contains('drop-zone')) {
        ev.target.appendChild(el);
    } else if (ev.target.parentNode.classList.contains('drop-zone')) {
        ev.target.parentNode.appendChild(el);
    }
}

function submitSection() {
    clearInterval(timerInterval);
    document.body.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background-color: var(--bg-main); color: var(--text-main); font-family: var(--font-main);">
            <i data-lucide="check-circle" style="width: 64px; height: 64px; color: #10b981; margin-bottom: 1rem;"></i>
            <h1 style="margin-bottom: 1rem;">Writing Section Completed!</h1>
            <p style="color: var(--text-muted); margin-bottom: 2rem;">Responses saved for manual review. Moving to Speaking Section...</p>
            <a href="speaking.html" class="btn btn-primary">Start Speaking Section</a>
        </div>
    `;
    lucide.createIcons();
}

function quitExam() {
    if(confirm("Are you sure you want to quit? Your progress will NOT be saved.")) {
        window.location.href = "dashboard.html";
    }
}
