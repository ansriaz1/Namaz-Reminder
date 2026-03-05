const prayers = ["Fajr","Dhuhr","Asr","Maghrib","Isha"];

let currentUser = localStorage.getItem("currentUser");
if(!currentUser){
    currentUser = prompt("Enter your name:");
    localStorage.setItem("currentUser", currentUser);
}

let allUsers = JSON.parse(localStorage.getItem("allUsers")) || {};
if(!allUsers[currentUser]) allUsers[currentUser] = {};
let data = allUsers[currentUser];

const today = new Date().toISOString().split("T")[0];

function saveData(){
    allUsers[currentUser] = data;
    localStorage.setItem("allUsers", JSON.stringify(allUsers));
}

function ensureDate(date){
    if(!data[date]){
        data[date] = {};
        prayers.forEach(p => data[date][p] = false);
    }
}

function displayDate(date){
    const d = new Date(date);
    const dayName = d.toLocaleDateString('en-US',{weekday:'long'});
    const hijri = new Intl.DateTimeFormat('en-TN-u-ca-islamic',{
        day:'numeric',month:'long',year:'numeric'
    }).format(d);

    document.getElementById("dateDisplay").innerHTML =
        `${dayName}<br>Gregorian: ${date}<br>Hijri: ${hijri}`;
}

function render(date){
    ensureDate(date);
    displayDate(date);

    const container = document.getElementById("prayerContainer");
    container.innerHTML = "";

    prayers.forEach(p=>{
        const div = document.createElement("div");
        div.className="prayer-box";

        const label=document.createElement("label");
        label.innerText=p;

        const cb=document.createElement("input");
        cb.type="checkbox";
        cb.checked=data[date][p];

        cb.onchange=function(){
            data[date][p]=this.checked;
            saveData();
            updateProgress();
            generateChart(data);
        };

        div.appendChild(label);
        div.appendChild(cb);
        container.appendChild(div);
    });
}

function updateProgress(){
    let total=0, done=0, qaza=0;
    const now=new Date();
    for(let d in data){
        const dateObj=new Date(d);
        if(dateObj.getMonth()===now.getMonth() &&
           dateObj.getFullYear()===now.getFullYear()){
            prayers.forEach(p=>{
                total++;
                if(data[d][p]) done++;
                else qaza++;
            });
        }
    }
    const percent= total===0?0:Math.round(done/total*100);
    document.getElementById("progressFill").style.width=percent+"%";
    document.getElementById("progressText").innerText=percent+"% Completed";
    document.getElementById("qazaCount").innerText=qaza;
}

function showHistory(){
    const h=document.getElementById("historySection");
    h.innerHTML="<h3>Select Date</h3>";
    Object.keys(data).sort().reverse().forEach(date=>{
        const btn=document.createElement("button");
        btn.innerText=date;
        btn.onclick=()=>render(date);
        h.appendChild(btn);
    });
}

render(today);
saveData();
updateProgress();
generateChart(data);

if('serviceWorker' in navigator){
    navigator.serviceWorker.register('service-worker.js');
}
