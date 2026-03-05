const prayers = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

/* =========================
   MULTI USER SYSTEM
========================= */
let currentUser = localStorage.getItem("currentUser");
if (!currentUser) {
    currentUser = prompt("Enter your name:");
    localStorage.setItem("currentUser", currentUser);
}

let allUsers = JSON.parse(localStorage.getItem("allUsers")) || {};
if (!allUsers[currentUser]) allUsers[currentUser] = {};

let data = allUsers[currentUser];

/* =========================
   DATE SYSTEM
========================= */
const today = new Date();
const gregorianDate = today.toISOString().split("T")[0];
const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });

const hijriDate = new Intl.DateTimeFormat('en-TN-u-ca-islamic', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
}).format(today);

document.getElementById("dateDisplay").innerHTML =
    `${dayName}<br>
     Gregorian: ${gregorianDate}<br>
     Hijri: ${hijriDate}`;

/* =========================
   INITIALIZE TODAY
========================= */
if (!data[gregorianDate]) {
    data[gregorianDate] = {};
    prayers.forEach(p => data[gregorianDate][p] = false);
}

/* =========================
   SAVE DATA
========================= */
function saveData() {
    allUsers[currentUser] = data;
    localStorage.setItem("allUsers", JSON.stringify(allUsers));
}

/* =========================
   RENDER PRAYERS (ANY DATE)
========================= */
function renderPrayers(date) {

    if (!data[date]) {
        data[date] = {};
        prayers.forEach(p => data[date][p] = false);
    }

    const container = document.getElementById("prayerContainer");
    container.innerHTML = "";

    prayers.forEach((prayer, index) => {

        const div = document.createElement("div");
        div.className = "prayer-box";
        div.style.animation = `fadeIn 0.4s ease forwards ${index*0.15}s`;

        const label = document.createElement("label");
        label.innerText = prayer + " ";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = data[date][prayer];

        checkbox.addEventListener("change", () => {
            data[date][prayer] = checkbox.checked;
            saveData();
            updateProgress();
            generateChart(data);
        });

        div.appendChild(label);
        div.appendChild(checkbox);
        container.appendChild(div);
    });
}

/* =========================
   MONTHLY PROGRESS
========================= */
function updateProgress() {
    let total = 0, completed = 0, qaza = 0;

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

    const progressFill = document.getElementById("progressFill");
    progressFill.style.width = percent + "%";
    progressFill.style.boxShadow = `0 0 20px rgba(255, 215, 0, ${percent/100})`;

    document.getElementById("progressText").innerText =
        percent + "% Completed This Month";

    document.getElementById("qazaCount").innerText = qaza;
}

/* =========================
   INTERACTIVE HISTORY
========================= */
function showHistory() {

    const historyDiv = document.getElementById("historySection");
    historyDiv.innerHTML = "<h3>Select a Date</h3>";

    Object.keys(data).sort().reverse().forEach(date => {

        const btn = document.createElement("button");
        btn.innerText = date;
        btn.style.margin = "5px";

        btn.onclick = () => {
            renderPrayers(date);
            window.scrollTo({ top: 0, behavior: "smooth" });
        };

        historyDiv.appendChild(btn);
    });
}

/* =========================
   NOTIFICATIONS
========================= */
if ("Notification" in window) Notification.requestPermission();

setTimeout(() => {
    if (Notification.permission === "granted") {
        new Notification("Namaz Reminder", {
            body: "Have you completed your prayers today?"
        });
    }
}, 4000);

/* =========================
   INITIAL LOAD
========================= */
renderPrayers(gregorianDate);
saveData();
updateProgress();
generateChart(data);

/* =========================
   PWA
========================= */
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js');
}
