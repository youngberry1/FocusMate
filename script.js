// ===== Dark Mode Toggle with localStorage =====
const toggleBtn = document.getElementById("toggle-theme");
const body = document.body;

function setDarkMode(isDark) {
    if (isDark) {
        body.classList.add("dark-mode");
        localStorage.setItem("darkMode", "true");
    } else {
        body.classList.remove("dark-mode");
        localStorage.setItem("darkMode", "false");
    }
}

// Initialize dark mode from localStorage
const savedDarkMode = localStorage.getItem("darkMode");
setDarkMode(savedDarkMode === "true");

// Toggle dark mode button event
toggleBtn.addEventListener("click", () => {
    setDarkMode(!body.classList.contains("dark-mode"));
});

// ===== Timer and other app code here (if any) =====
// You can add your timer functionality here.

// ===== Distraction Logging =====
const logBtn = document.getElementById("log-distraction");
const reasonInput = document.getElementById("distraction-reason");
const distractionCountDisplay = document.getElementById("distraction-count");
const distractionLogList = document.getElementById("distraction-log");

const exportJsonBtn = document.getElementById("export-json");
const exportTxtBtn = document.getElementById("export-txt");

// Helper to get YYYY-MM-DD string
function getTodayDate() {
    return new Date().toISOString().split("T")[0];
}

// Load distractions & check if day changed
let distractions = JSON.parse(localStorage.getItem("distractions")) || [];
const savedDate = localStorage.getItem("distractionsDate");
const today = getTodayDate();

if (savedDate !== today) {
    distractions = [];
    localStorage.setItem("distractionsDate", today);
    localStorage.setItem("distractions", JSON.stringify(distractions));
}

// Save distractions and date
function saveDistractions() {
    localStorage.setItem("distractions", JSON.stringify(distractions));
    localStorage.setItem("distractionsDate", getTodayDate());
}

// Render distraction list with delete buttons
function renderDistractions() {
    distractionLogList.innerHTML = "";
    distractionCountDisplay.textContent = `Distractions: ${distractions.length}`;

    distractions.forEach((entry, index) => {
        const li = document.createElement("li");
        li.textContent = `${index + 1}. ${entry.reason} — ${entry.time} `;

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.style.marginLeft = "1rem";
        deleteBtn.style.padding = "0.2rem 0.5rem";
        deleteBtn.style.fontSize = "0.8rem";
        deleteBtn.style.cursor = "pointer";
        deleteBtn.style.borderRadius = "4px";
        deleteBtn.style.border = "none";
        deleteBtn.style.backgroundColor = "#e74c3c";
        deleteBtn.style.color = "white";

        deleteBtn.addEventListener("click", () => {
            distractions.splice(index, 1);
            saveDistractions();
            renderDistractions();
        });

        li.appendChild(deleteBtn);
        distractionLogList.appendChild(li);
    });
}

// Log a new distraction
function logDistraction() {
    const reason = reasonInput.value.trim();
    if (reason === "") return;

    const timestamp = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });

    distractions.push({ reason, time: timestamp });
    saveDistractions();
    renderDistractions();

    reasonInput.value = "";
}

logBtn.addEventListener("click", logDistraction);

// Export functions
function exportToJson() {
    const dataStr = JSON.stringify(distractions, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `distractions-${getTodayDate()}.json`;
    a.click();

    URL.revokeObjectURL(url);
}

function exportToTxt() {
    let txtContent = distractions
        .map((d, i) => `${i + 1}. ${d.reason} — ${d.time}`)
        .join("\n");

    const blob = new Blob([txtContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `distractions-${getTodayDate()}.txt`;
    a.click();

    URL.revokeObjectURL(url);
}

exportJsonBtn.addEventListener("click", exportToJson);
exportTxtBtn.addEventListener("click", exportToTxt);

// Initial render on page load
renderDistractions();
