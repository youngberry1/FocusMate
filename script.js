// ====== DOM Elements ======
const body = document.body;
const toggleThemeBtn = document.getElementById('toggle-theme');
const timerDisplay = document.querySelector('.timer-display');
const startBtn = document.getElementById('start-timer');
const resetBtn = document.getElementById('reset-timer');
const focusInput = document.getElementById('focus-time');
const breakInput = document.getElementById('break-time');
const logDistractionBtn = document.getElementById('log-distraction');
const distractionReasonInput = document.getElementById('distraction-reason');
const focusTotalP = document.getElementById('focus-total');
const distractionCountP = document.getElementById('distraction-count');
const distractionLogUl = document.getElementById('distraction-log');

// ====== State ======
let timer = null;
let isRunning = false;
let isFocusTime = true;
let timeLeft = 0; // in seconds
let totalFocusSeconds = 0;

let distractions = JSON.parse(localStorage.getItem('distractions')) || [];
let darkMode = localStorage.getItem('darkMode') === 'true';

// ====== Initialize ======
function initialize() {
    applyDarkMode(darkMode);
    updateTimerDisplay(getFocusTimeSeconds());
    updateStats();
    renderDistractions();
}
initialize();

// ====== Helpers ======
function getFocusTimeSeconds() {
    const val = parseInt(focusInput.value);
    return isNaN(val) || val <= 0 ? 25 * 60 : val * 60;
}

function getBreakTimeSeconds() {
    const val = parseInt(breakInput.value);
    return isNaN(val) || val <= 0 ? 5 * 60 : val * 60;
}

function secondsToMMSS(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

function updateTimerDisplay(seconds) {
    timerDisplay.textContent = secondsToMMSS(seconds);
}

function updateStats() {
    focusTotalP.textContent = `Total Focus Time: ${Math.floor(totalFocusSeconds / 60)} mins`;
    distractionCountP.textContent = `Distractions: ${distractions.length}`;
}

function saveDistractions() {
    localStorage.setItem('distractions', JSON.stringify(distractions));
}

function renderDistractions() {
    distractionLogUl.innerHTML = '';
    if (distractions.length === 0) {
        distractionLogUl.innerHTML = '<li>No distractions logged yet.</li>';
        return;
    }
    distractions.forEach(({ reason, timestamp }, index) => {
        const li = document.createElement('li');
        li.textContent = `[${new Date(timestamp).toLocaleTimeString()}] ${reason || 'No reason given'}`;

        const delBtn = document.createElement('button');
        delBtn.textContent = '✕';
        delBtn.title = 'Remove distraction';
        delBtn.addEventListener('click', () => {
            distractions.splice(index, 1);
            saveDistractions();
            updateStats();
            renderDistractions();
        });

        li.appendChild(delBtn);
        distractionLogUl.appendChild(li);
    });
}

// ====== Timer Logic ======
function startTimer() {
    if (isRunning) return;

    isRunning = true;
    startBtn.disabled = true;

    timer = setInterval(() => {
        timeLeft--;

        if (isFocusTime) {
            totalFocusSeconds++;
            updateStats();
        }

        updateTimerDisplay(timeLeft);

        if (timeLeft <= 0) {
            clearInterval(timer);
            isRunning = false;
            startBtn.disabled = false;

            // Toggle focus/break
            isFocusTime = !isFocusTime;
            timeLeft = isFocusTime ? getFocusTimeSeconds() : getBreakTimeSeconds();

            alert(isFocusTime ? 'Break is over! Time to focus.' : 'Focus session over! Time for a break.');

            updateTimerDisplay(timeLeft);
        }
    }, 1000);
}

function resetTimer() {
    clearInterval(timer);
    isRunning = false;
    startBtn.disabled = false;
    isFocusTime = true;
    timeLeft = getFocusTimeSeconds();
    updateTimerDisplay(timeLeft);
}

// ====== Dark Mode Logic ======
function applyDarkMode(enabled) {
    if (enabled) {
        body.classList.add('dark-mode');
        toggleThemeBtn.textContent = '☀️ Light Mode';
    } else {
        body.classList.remove('dark-mode');
        toggleThemeBtn.textContent = '🌙 Dark Mode';
    }
    localStorage.setItem('darkMode', enabled);
}

// ====== Event Listeners ======

// Dark mode toggle
toggleThemeBtn.addEventListener('click', () => {
    darkMode = !darkMode;
    applyDarkMode(darkMode);
});

// Timer controls
startBtn.addEventListener('click', () => {
    if (!isRunning) {
        if (timeLeft <= 0) {
            timeLeft = isFocusTime ? getFocusTimeSeconds() : getBreakTimeSeconds();
        }
        startTimer();
    }
});

resetBtn.addEventListener('click', () => {
    resetTimer();
});

// Inputs reset timer on change
focusInput.addEventListener('change', () => {
    if (!isRunning) {
        timeLeft = getFocusTimeSeconds();
        updateTimerDisplay(timeLeft);
    }
});
breakInput.addEventListener('change', () => {
    if (!isRunning && !isFocusTime) {
        timeLeft = getBreakTimeSeconds();
        updateTimerDisplay(timeLeft);
    }
});

// Log distraction
logDistractionBtn.addEventListener('click', () => {
    const reason = distractionReasonInput.value.trim();
    distractions.push({ reason, timestamp: Date.now() });
    saveDistractions();
    updateStats();
    renderDistractions();
    distractionReasonInput.value = '';
});

// Prevent form submit on Enter in distraction input
distractionReasonInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        logDistractionBtn.click();
    }
});

const exportJsonBtn = document.getElementById('export-json-button');
const exportTxtBtn = document.getElementById('export-txt-button');


function download(filename, content, type = 'text/plain') {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

function exportDistractionsJSON() {
    if (distractions.length === 0) {
        alert("No distractions to export!");
        return;
    }
    const jsonStr = JSON.stringify(distractions, null, 2);
    download('distractions.json', jsonStr, 'application/json');
}

function exportDistractionsTXT() {
    if (distractions.length === 0) {
        alert("No distractions to export!");
        return;
    }
    // Format as timestamp - reason lines
    const lines = distractions.map(({ reason, timestamp }) => {
        const timeStr = new Date(timestamp).toLocaleString();
        return `[${timeStr}] ${reason || 'No reason given'}`;
    });
    const txtContent = lines.join('\n');
    download('distractions.txt', txtContent, 'text/plain');
}

// Add event listeners for export buttons
exportJsonBtn.addEventListener('click', exportDistractionsJSON);
exportTxtBtn.addEventListener('click', exportDistractionsTXT);
