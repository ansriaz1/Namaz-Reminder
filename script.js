const prayers = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

/* =====================
   MULTI USER SYSTEM
===================== */
let currentUser = localStorage.getItem("currentUser");
if (!currentUser) {
    currentUser = prompt("Enter your name:");
    localStorage.setItem("currentUser", currentUser);
}

let allUsers = JSON.parse(localStorage.getItem("allUsers")) || {};
if (!allUsers[currentUser]) allUsers[currentUser] = {};
let data = allUsers[currentUser];

/* =====================
   TODAY DATE
===================== */
const todayObj = new Date();
const today = todayObj.toISOString().split("T")[0];

/* =====================
   DISPLAY DATE
===================== */
function displayDate(dateString) {

    const dateObj = new Date(dateString);
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

    const hijriDate = new Intl.DateTimeFormat('en-TN-u-ca-islamic', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(dateObj);

    document.getElementById("dateDisplay").innerHTML =
        `${dayName}<br>
         Gregorian: ${dateString}<br>
         Hijri: ${hijriDate}`;
}

/* =====================
   INITIALIZE DATE DATA
===================== */
function ensureDateExists(date) {
    if (!data[date]) {
        data[date] = {};
        prayers.forEach(p => data[date][p] = false);
    }
}

/* =====================
   SAVE
===================== */
function saveData() {
    allUsers[currentUser] = data;
    localStorage.setItem("allUsers", JSON.stringify(allUsers));
}

/* =====================
   RENDER PRAYERS
===================== */
function renderPrayers(date) {

    ensureDateExists(date);
    displayDate(date);

    const container = document.getElementById("prayerContainer");
    container.innerHTML = "";

    prayers.forEach((prayer, index) => {

        const div = document.createElement("div");
        div.className = "prayer-box";
        div.style.animation = `fadeIn 0.4s ease forwards ${index*0.1}s`;

        const label = document.createElement("label");
        label.innerText = prayer + " ";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = data[date][prayer];

        checkbox.onchange = function () {
            data[date][prayer] = this.checked;
            saveData();
            updateProgress();
            generateChart(data);
        };

        div.appendChild(label);
        div.appendChild(checkbox);
        container.appendChild(div);
    });
}

/* =====================
   PROGRESS
===================== */
function updateProgress() {

    let total = 0;
    let completed = 0;
    let qaza = 0;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

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

/* =====================
   HISTORY
===================== */
function showHistory() {

    const historyDiv = document.getElementById("historySection");
    historyDiv.innerHTML = "<h3>Select Date</h3>";

    const dates = Object.keys(data).sort().reverse();

    dates.forEach(date => {

        const btn = document.createElement("button");
        btn.innerText = date;
        btn.style.margin = "5px";

        btn.onclick = function () {
            renderPrayers(date);
            window.scrollTo({ top: 0, behavior: "smooth" });
        };

        historyDiv.appendChild(btn);
    });
}

/* =====================
   NOTIFICATION
===================== */
if ("Notification" in window) Notification.requestPermission();

/* =====================
   INITIAL LOAD
===================== */
ensureDateExists(today);
renderPrayers(today);
saveData();
updateProgress();
generateChart(data);

/* =====================
   PWA
===================== */
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js');
}
