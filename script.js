// ========== 1. DOM ELEMENTS ==========
// Grab all the elements from the HTML we will interact with
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
const exportJsonBtn = document.getElementById('export-json-button');
const exportTxtBtn = document.getElementById('export-txt-button');

// ========== 2. STATE VARIABLES ==========
let timer = null;                     // Holds the setInterval reference
let isRunning = false;               // True if timer is currently running
let isFocusTime = true;              // True if it's focus time, false if it's break
let timeLeft = 0;                    // Remaining time in seconds
let totalFocusSeconds = 0;           // Total time spent focusing

// Load from localStorage or initialize defaults
let distractions = JSON.parse(localStorage.getItem('distractions')) || [];
let darkMode = localStorage.getItem('darkMode') === 'true';

// ========== 3. INITIALIZATION ==========
function initialize() {
    applyDarkMode(darkMode);                           // Apply theme
    timeLeft = getFocusTimeSeconds();                  // Set initial timer value
    updateTimerDisplay(timeLeft);                      // Show timer
    updateStats();                                     // Show stats
    renderDistractions();                              // Display past distractions
}
initialize();

// ========== 4. HELPER FUNCTIONS ==========

// Convert focus time input (minutes) to seconds
function getFocusTimeSeconds() {
    const val = parseInt(focusInput.value);
    return isNaN(val) || val <= 0 ? 25 * 60 : val * 60;
}

// Convert break time input (minutes) to seconds
function getBreakTimeSeconds() {
    const val = parseInt(breakInput.value);
    return isNaN(val) || val <= 0 ? 5 * 60 : val * 60;
}

// Convert seconds to "mm:ss" format
function secondsToMMSS(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

// Update the text on the timer display
function updateTimerDisplay(seconds) {
    timerDisplay.textContent = secondsToMMSS(seconds);
}

// Update total focus time and number of distractions
function updateStats() {
    focusTotalP.textContent = `Total Focus Time: ${Math.floor(totalFocusSeconds / 60)} mins`;
    distractionCountP.textContent = `Distractions: ${distractions.length}`;
}

// Save distraction data to localStorage
function saveDistractions() {
    localStorage.setItem('distractions', JSON.stringify(distractions));
}

// ========== 5. TIMER LOGIC ==========

// Start the countdown timer
function startTimer() {
    if (isRunning) return; // Do nothing if already running

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

            // Switch between focus and break sessions
            isFocusTime = !isFocusTime;
            timeLeft = isFocusTime ? getFocusTimeSeconds() : getBreakTimeSeconds();

            alert(isFocusTime ? 'Break is over! Time to focus.' : 'Focus session over! Time for a break.');
            updateTimerDisplay(timeLeft);
        }
    }, 1000);
}

// Stop the timer and reset state
function resetTimer() {
    clearInterval(timer);
    isRunning = false;
    startBtn.disabled = false;
    isFocusTime = true;
    timeLeft = getFocusTimeSeconds();
    updateTimerDisplay(timeLeft);
}

// ========== 6. DISTRACTION LOGIC ==========

// Render the list of logged distractions
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

// ========== 7. DARK MODE LOGIC ==========

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

// ========== 8. EXPORT LOGIC ==========

// Reusable download helper for both TXT and JSON
function download(filename, content, type = 'text/plain') {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// Export distraction log as JSON
function exportDistractionsJSON() {
    if (distractions.length === 0) {
        alert("No distractions to export!");
        return;
    }
    const jsonStr = JSON.stringify(distractions, null, 2);
    download('distractions.json', jsonStr, 'application/json');
}

// Export distraction log as TXT
function exportDistractionsTXT() {
    if (distractions.length === 0) {
        alert("No distractions to export!");
        return;
    }

    const lines = distractions.map(({ reason, timestamp }) => {
        const timeStr = new Date(timestamp).toLocaleString();
        return `[${timeStr}] ${reason || 'No reason given'}`;
    });

    const txtContent = lines.join('\n');
    download('distractions.txt', txtContent, 'text/plain');
}

// ========== 9. EVENT LISTENERS ==========

// Toggle dark mode
toggleThemeBtn.addEventListener('click', () => {
    darkMode = !darkMode;
    applyDarkMode(darkMode);
});

// Start timer
startBtn.addEventListener('click', () => {
    if (!isRunning) {
        if (timeLeft <= 0) {
            timeLeft = isFocusTime ? getFocusTimeSeconds() : getBreakTimeSeconds();
        }
        startTimer();
    }
});

// Reset timer
resetBtn.addEventListener('click', resetTimer);

// When focus/break values change, reset timer display
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

// Log a distraction
logDistractionBtn.addEventListener('click', () => {
    const reason = distractionReasonInput.value.trim();
    distractions.push({ reason, timestamp: Date.now() });
    saveDistractions();
    updateStats();
    renderDistractions();
    distractionReasonInput.value = '';
});

// Prevent Enter key from submitting form
distractionReasonInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        logDistractionBtn.click();
    }
});

// Export buttons
exportJsonBtn.addEventListener('click', exportDistractionsJSON);
exportTxtBtn.addEventListener('click', exportDistractionsTXT);
