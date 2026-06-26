const tasks = [
    {
        id: 1,
        title: 'Task 1: Listen and Repeat',
        type: 'listen_repeat',
        instruction: 'Listen carefully to the audio. When it finishes, recording will start automatically — repeat the sentence clearly.',
        prompt: '"The university decided to construct a new library to accommodate the growing student population."',
        audioSrc: null, // Set to audio URL in production
        prepTime: 0,    // No prep time — recording starts immediately after audio
        recordTime: 15
    },
    {
        id: 2,
        title: 'Task 2: Take an Interview',
        type: 'interview',
        instruction: 'Listen to the question. You will have 45 seconds to respond after the audio ends.',
        prompt: 'Some people prefer to study alone, while others prefer to study in groups. Which do you prefer and why?',
        audioSrc: null,
        prepTime: 0,
        recordTime: 45
    }
];

let currentTaskIndex = 0;
let phase = 'idle'; // 'idle', 'prep', 'record'
let timerInterval;

// Audio Recording Setup
let mediaRecorder;
let audioChunks = [];

document.addEventListener('DOMContentLoaded', () => {
    initAudio();
    renderTask();
});

async function initAudio() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        
        mediaRecorder.ondataavailable = event => {
            audioChunks.push(event.data);
        };
        
        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            // In reality, this blob would be uploaded to the backend via fetch
            console.log("Audio recording saved locally.", audioBlob);
            audioChunks = []; // reset
        };
    } catch (err) {
        alert("Microphone access is required for the Speaking section.");
    }
}

function renderTask() {
    const task = tasks[currentTaskIndex];
    const container = document.getElementById('exam-container');
    
    container.innerHTML = `
        <div class="prompt-card">
            <span style="font-weight: 600; font-size: 14px; color: var(--text-muted); text-transform: uppercase;">${task.title}</span>
            <h2 style="margin: 1rem 0;">${task.instruction}</h2>
            <p style="font-size: 18px; font-family: var(--font-reading); color: var(--primary-color);">${task.prompt}</p>
        </div>
        
        <div class="status-text" id="status-text">Click Start when ready</div>
        
        <div class="mic-container" id="mic-ui">
            <i data-lucide="mic" style="width: 48px; height: 48px;"></i>
        </div>
        
        <div class="countdown" id="countdown-display">00</div>
        
        <button class="btn btn-primary" id="action-btn" onclick="startSequence()">
            <i data-lucide="play" style="width: 18px;"></i> Start Task
        </button>
    `;
    lucide.createIcons();
}

function startSequence() {
    document.getElementById('action-btn').style.display = 'none';
    const task = tasks[currentTaskIndex];

    if (task.type === 'listen_repeat') {
        // PRD: Play audio ONCE. Recording starts AUTOMATICALLY when audio ends.
        playAudioThenRecord();
    } else {
        // PRD: Interview — play audio prompt then give recording time
        playAudioThenRecord();
    }
}

function playAudioThenRecord() {
    const task = tasks[currentTaskIndex];
    const status = document.getElementById('status-text');
    const display = document.getElementById('countdown-display');
    
    status.textContent = 'Playing audio prompt...';
    status.style.color = 'var(--primary-color)';
    display.textContent = '♪';

    if (task.audioSrc) {
        // Play real audio
        const audio = new Audio(task.audioSrc);
        audio.play();
        audio.onended = () => startRecordTimer(); // Auto-start recording when audio ends
    } else {
        // No audio file: simulate 3-second audio prompt then auto-record
        let simulatedTime = 3;
        display.textContent = simulatedTime;
        const sim = setInterval(() => {
            simulatedTime--;
            display.textContent = simulatedTime > 0 ? simulatedTime : '▶';
            if (simulatedTime <= 0) {
                clearInterval(sim);
                startRecordTimer(); // Auto-start recording immediately after
            }
        }, 1000);
    }
}

function startPrepTimer() {
    phase = 'prep';
    const task = tasks[currentTaskIndex];
    let time = task.prepTime;
    
    const status = document.getElementById('status-text');
    const display = document.getElementById('countdown-display');
    const micUI = document.getElementById('mic-ui');
    
    status.textContent = "Preparation Time";
    status.style.color = "var(--text-main)";
    
    display.textContent = time < 10 ? '0'+time : time;
    
    timerInterval = setInterval(() => {
        time--;
        display.textContent = time < 10 ? '0'+time : time;
        
        if (time <= 0) {
            clearInterval(timerInterval);
            startRecordTimer();
        }
    }, 1000);
}

function startRecordTimer() {
    phase = 'record';
    const task = tasks[currentTaskIndex];
    let time = task.recordTime;
    
    const status = document.getElementById('status-text');
    const display = document.getElementById('countdown-display');
    const micUI = document.getElementById('mic-ui');
    
    status.textContent = "Recording...";
    status.style.color = "#ef4444"; // red
    micUI.classList.add('recording');
    
    display.textContent = time < 10 ? '0'+time : time;
    
    if (mediaRecorder && mediaRecorder.state === "inactive") {
        mediaRecorder.start();
    }
    
    timerInterval = setInterval(() => {
        time--;
        display.textContent = time < 10 ? '0'+time : time;
        
        if (time <= 0) {
            clearInterval(timerInterval);
            stopRecordingAndNext();
        }
    }, 1000);
}

function stopRecordingAndNext() {
    if (mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.stop(); // Triggers onstop event
    }
    
    if (currentTaskIndex === tasks.length - 1) {
        submitExam();
    } else {
        currentTaskIndex++;
        renderTask();
    }
}

function submitExam() {
    document.body.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background-color: var(--bg-main); color: var(--text-main); font-family: var(--font-main);">
            <i data-lucide="award" style="width: 80px; height: 80px; color: var(--primary-color); margin-bottom: 1rem;"></i>
            <h1 style="margin-bottom: 1rem;">Exam Completed!</h1>
            <p style="color: var(--text-muted); margin-bottom: 2rem;">Your responses have been saved and are pending grading.</p>
            <a href="results.html" class="btn btn-primary">View Results Report</a>
        </div>
    `;
    lucide.createIcons();
}

function quitExam() {
    if(confirm("Are you sure you want to quit? Your progress will NOT be saved.")) {
        window.location.href = "dashboard.html";
    }
}
