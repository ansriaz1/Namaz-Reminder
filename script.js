const prayers = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

// Multi-user system
let currentUser = localStorage.getItem("currentUser");
if (!currentUser) {
    currentUser = prompt("Enter your name:");
    localStorage.setItem("currentUser", currentUser);
}

let allUsers = JSON.parse(localStorage.getItem("allUsers")) || {};
if (!allUsers[currentUser]) allUsers[currentUser] = {};

let data = allUsers[currentUser];

// Dates
const today = new Date();
const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
const gregorianDate = today.toISOString().split("T")[0];
const hijriDate = new Intl.DateTimeFormat('en-TN-u-ca-islamic', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
}).format(today);

document.getElementById("dateDisplay").innerHTML =
    `${dayName} <br> Gregorian: ${gregorianDate} <br> Hijri: ${hijriDate}`;

// Create today's data if not exists
if (!data[gregorianDate]) {
    data[gregorianDate] = {};
    prayers.forEach(p => data[gregorianDate][p] = false);
}

// Save function
function saveData() {
    allUsers[currentUser] = data;
    localStorage.setItem("allUsers", JSON.stringify(allUsers));
}

// Update monthly progress & Qaza
function updateProgress() {
    let total = 0;
    let completed = 0;
    let qaza = 0;
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    for (let date in data) {
        const d = new Date(date);
        if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
            prayers.forEach(p => {
                total++;
                if (data[date][p]) completed++;
                else qaza++;
            });
        }
    }

    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
    document.getElementById("progressFill").style.width = percent + "%";
    document.getElementById("progressText").innerText =
        percent + "% Completed This Month";
    document.getElementById("qazaCount").innerText = qaza;
}

// Render prayers
const container = document.getElementById("prayerContainer");
container.innerHTML = "";

prayers.forEach(prayer => {
    const div = document.createElement("div");
    div.className = "prayer-box";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = data[gregorianDate][prayer];

    checkbox.addEventListener("change", () => {
        data[gregorianDate][prayer] = checkbox.checked;
        saveData();
        updateProgress();
        generateChart(data);
    });

    div.innerHTML = `<label>${prayer}</label> `;
    div.appendChild(checkbox);
    container.appendChild(div);
});

// Show history
function showHistory() {
    const historyDiv = document.getElementById("historySection");
    historyDiv.innerHTML = "<h3>History</h3>";
    Object.keys(data).sort().reverse().forEach(date => {
        let row = `<p><strong>${date}</strong> : `;
        prayers.forEach(p => {
            row += data[date][p] ? "✅ " : "❌ ";
        });
        row += "</p>";
        historyDiv.innerHTML += row;
    });
}

// Notifications
function requestNotificationPermission() {
    if ("Notification" in window) Notification.requestPermission();
}

function scheduleReminder() {
    const now = new Date();
    const reminderTime = new Date();
    reminderTime.setHours(20,0,0,0); // 8 PM reminder
    if (now > reminderTime) return;
    const timeout = reminderTime - now;
    setTimeout(() => {
        new Notification("Namaz Reminder", {
            body: "Have you completed your prayers today?",
        });
    }, timeout);
}

requestNotificationPermission();
scheduleReminder();

// Initialize
saveData();
updateProgress();
generateChart(data);

// PWA registration
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js');
                                          }
