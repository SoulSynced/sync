const firebaseConfig = {
  apiKey: "AIzaSyBTwPB6IHc8IwzxMpAipRALZZJ395PQdAA",
  authDomain: "soul-sync-123.firebaseapp.com",
  databaseURL: "https://soul-sync-123-default-rtdb.firebaseio.com", 
  projectId: "soul-sync-123",
  storageBucket: "soul-sync-123.firebasestorage.app",
  messagingSenderId: "579254577012",
  appId: "1:579254577012:web:bd24c62b4a2d962eebee21"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

const ACTIVITIES = ["Watching TV", "Shopping", "People Watching", "Hiking", "Eating Out"];
const MOVIES = ["Horror", "Comedy", "Action", "Romance", "Sci-Fi"];
const LOVE = ["Quality Time", "Gifts", "Touch", "Service", "Words"];
const TRAITS = ["Funny", "Warm", "Creative", "Optimistic", "Curious", "Ambitious"];
const HUMOR = ["Silly", "Dark", "Dad Jokes", "Chronically Online", "Satire"];
const JOBS = ["Engineer", "Doctor", "Lawyer", "Disappointment", "Unemployed"];
const EMOJIS = ["💖", "✨", "🌸", "🤍", "🎀", "💕"];

const fakeUsers = [
    { name: "Timmy", age: 18, job: "Disappointment", contact: "@TimthatlikesBallet&Opera", humor: "Dark", movie: "Horror", myTraits: ["Creative", "Curious"], targetTraits: ["Funny"] },
    { name: "Joe", age: 18, job: "Engineer", contact: "Joe.doe", humor: "Satire", movie: "Sci-Fi", myTraits: ["Ambitious"], targetTraits: ["Creative"] },
    { name: "Penelope", age: 18, job: "Disappointment", contact: "@Penpinappleapplepen", humor: "Chronically Online", movie: "Comedy", myTraits: ["Warm"], targetTraits: ["Curious"] }
];

let liveDatabase = [...fakeUsers]; 

db.ref("users").on("value", (snapshot) => {
    const data = snapshot.val();
    liveDatabase = [...fakeUsers]; 
    if (data) {
        for (let id in data) {
            liveDatabase.push(data[id]);
        }
    }
});

function nextStep(stepId) {
    document.getElementById('landing-screen').classList.add('hidden');
    document.getElementById('form-screen').classList.remove('hidden');

    document.querySelectorAll('.form-step').forEach(step => {
        step.classList.add('hidden');
    });

    if (stepId === 'form-screen' || !stepId) {
        document.getElementById('step-1').classList.remove('hidden');
    } else {
        const target = document.getElementById(stepId);
        if (target) target.classList.remove('hidden');
    }
    
    window.scrollTo(0, 0);
}

function setupForm() {
    const genderOptions = `<option value="" disabled selected>Your Gender</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>`;
    document.getElementById("gender").innerHTML = genderOptions;
    
    const prefOptions = `<option value="" disabled selected>Partner Preference</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option><option value="Any">Any</option>`;
    document.getElementById("prefGender").innerHTML = prefOptions;
    
    let jobHtml = "<option value='' disabled selected>Select Career</option>";
    JOBS.forEach(j => jobHtml += `<option value="${j}">${j}</option>`);
    document.getElementById("job").innerHTML = jobHtml;
    
    const sections = [
        { id: "activityList", data: ACTIVITIES, name: "act", type: "checkbox", limit: 2 },
        { id: "movieList", data: MOVIES, name: "movie", type: "radio" },
        { id: "loveList", data: LOVE, name: "love", type: "radio" },
        { id: "userTraitList", data: TRAITS, name: "myTrait", type: "checkbox", limit: 2 },
        { id: "targetTraitList", data: TRAITS, name: "targetTrait", type: "checkbox", limit: 2 },
        { id: "humorList", data: HUMOR, name: "humor", type: "radio" }
    ];
    
    sections.forEach(section => {
        const el = document.getElementById(section.id);
        if(!el) return;
        let html = "";
        section.data.forEach(item => {
            html += `<label class="checkbox-label"><input type="${section.type}" name="${section.name}" value="${item}"><span>${item}</span></label>`;
        });
        el.innerHTML = html;
        
        if (section.limit) {
            el.addEventListener('change', (e) => {
                if (el.querySelectorAll('input:checked').length > section.limit) {
                    e.target.checked = false;
                }
            });
        }
    });
}

function runMatchmaking() {
    const name = document.getElementById("name").value;
    const age = document.getElementById("age").value;
    const contact = document.getElementById("contact").value;
    
    if (!name || !age || !contact) { 
        alert("Please complete your information! 🌸"); 
        return; 
    }
    
    const btn = document.getElementById("syncBtn");
    btn.innerText = "Syncing...";
    btn.disabled = true;

    const newUser = {
        name: name,
        age: parseInt(age),
        contact: contact,
        job: document.getElementById("job").value,
        movie: (document.querySelector('input[name="movie"]:checked') || {}).value || "",
        humor: (document.querySelector('input[name="humor"]:checked') || {}).value || "",
        myTraits: Array.from(document.querySelectorAll('input[name="myTrait"]:checked')).map(el => el.value),
        targetTraits: Array.from(document.querySelectorAll('input[name="targetTrait"]:checked')).map(el => el.value)
    };

    db.ref("users").push(newUser).then(() => {
        setTimeout(() => {
            const results = liveDatabase.filter(p => p.name !== newUser.name).map(p => {
                let score = 40;
                let common = [];
                if (p.myTraits && newUser.targetTraits) {
                    p.myTraits.forEach(t => { 
                        if (newUser.targetTraits.includes(t)) { 
                            score += 20; 
                            common.push(t); 
                        }
                    });
                }
                if (p.humor === newUser.humor) { score += 10; common.push(p.humor + " Humor"); }
                if (p.movie === newUser.movie) { score += 10; common.push(p.movie + " Movies"); }
                return {...p, matchScore: score > 99 ? 99 : score, common: common};
            });
            displayResults(results);
        }, 1500);
    }).catch(err => {
        btn.innerText = "Begin Sync";
        btn.disabled = false;
        alert("Sync failed. Check your Firebase Rules! ⚠️");
    });
}

function displayResults(results) {
    document.getElementById("form-screen").classList.add("hidden");
    document.getElementById("results").classList.remove("hidden");
    const display = document.getElementById("matchDisplay");
    display.innerHTML = "";
    
    results.sort((a,b) => b.matchScore - a.matchScore).slice(0, 3).forEach(m => {
        const card = document.createElement("div");
        card.className = "match-card";
        card.innerHTML = `<span>${m.name}</span><strong>${m.matchScore}%</strong>`;
        card.onclick = () => {
            const commonHtml = m.common.length > 0 ? `<p><strong>Shared Interests:</strong> ${m.common.join(", ")}</p>` : "";
            document.getElementById("modalBody").innerHTML = `
                <h2 class="logo-small">${m.name}, ${m.age}</h2>
                <p><strong>Career:</strong> ${m.job || 'Secret'}</p>
                <p><strong>Contact:</strong> ${m.contact}</p>
                ${commonHtml}
                <hr>
                <p style="font-style: italic; color: #a37c85;">Reach out by their contact and stop being a loner! </p>
            `;
            document.getElementById("profileModal").classList.remove("hidden");
        };
        display.appendChild(card);
    });
}

function closeModal() { document.getElementById("profileModal").classList.add("hidden"); }
function resetForm() { location.reload(); }

function createFloatingBackground() {
    const container = document.getElementById("emoji-container");
    if(!container) return;
    for (let i = 0; i < 15; i++) {
        const span = document.createElement("span");
        span.className = "floating-emoji";
        span.innerText = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
        span.style.left = (Math.random() * 100) + "vw";
        span.style.animationDelay = (Math.random() * 10) + "s";
        container.appendChild(span);
    }
}

createFloatingBackground();
setupForm();
