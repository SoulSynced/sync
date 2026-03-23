const ACTIVITIES = ["📺 Watching TV/Playing Games", "🛍️ Window Shopping at the Mall", "🧺 Picnic at the Park", "🔓 Escape Room", "🥾 Going on Hikes", "🍝 Going out to Eat"];
const TRAITS = ["😂 Funny", "💖 Kind", "🎨 Creative", "🧘 Calm", "🗣️ Outgoing", "🧗 Adventurous", "🚀 Ambitious", "😇 Honest", "🤝 Loyal", "🧠 Academic"];
const HOBBIES = [ "Art" , "Music", "Gym", "Sleeping" , "Cooking/Baking", "DoomScrolling", "People Watch"]
const HUMOR = ["Silly Jokes", "Dark Humor", "Dad Jokes", "Chronically Online", "Satire"]
const JOBS =  ["Engineer", "Doctor", "Lawyer", "Mcdonald's Worker", "Not Real Job L"
const ZODIAC = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagitarrius", "Capricorn", "Aquarius", "Pisces", "idc"]
const GENRE = [ "Horror/Pyscological Thriller", "Comedy", "Action", "Romance", "Drama", "Anime"]
const LOVELANG = ["Words of Affiramtion", "Phsycial Touch", " Giving/Receiving Gifts", "Quality Time", "Acts of Service"] 
const EMOJIS = ['💖', '✨', '💜', '💫', '🌸'];

const starterPack = [
    { name: "Luna 🌙", age: 16, gender: "Female", activities: ["🥾 Hiking", "🍝 Restaurant"], traits: ["🧗 Adventurous", "🧠 Smart", "😂 Funny"] },
    { name: "Kai 🌊", age: 19, gender: "Male", activities: ["📺 Watching TV", "🔓 Escape Room"], traits: ["🧘 Calm", "😇 Honest", "🎨 Creative"] },
    { name: "Skye ☁️", age: 16, gender: "Nonbinary", activities: ["🛍️ Mall", "🧺 Picnic"], traits: ["🗣️ Outgoing", "💖 Kind", "🤝 Loyal"] },
    { name: "Charlie ✨", age: 17, gender: "Genderqueer", activities: ["🔓 Escape Room", "🧺 Picnic"], traits: ["🎨 Creative", "🧠 Smart", "🤝 Loyal"] }
];

let database = JSON.parse(localStorage.getItem('soulSyncedDB')) || starterPack;

function createFloatingBackground() {
    const container = document.getElementById('emoji-container');
    for (let i = 0; i < 15; i++) {
        const span = document.createElement('span');
        span.className = 'floating-emoji';
        span.innerText = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
        span.style.left = Math.random() * 100 + 'vw';
        span.style.animationDelay = Math.random() * 12 + 's';
        span.style.fontSize = (Math.random() * 20 + 15) + 'px';
        container.appendChild(span);
    }
}

function setupForm() {
    const actContainer = document.getElementById('activityList');
    const userTraitContainer = document.getElementById('userTraitList');
    const prefTraitContainer = document.getElementById('prefTraitList');

    actContainer.innerHTML = "";
    userTraitContainer.innerHTML = "";
    prefTraitContainer.innerHTML = "";

    ACTIVITIES.forEach(a => {
        actContainer.innerHTML += `<label class="checkbox-label"><input type="checkbox" name="act" value="${a}"><span>${a}</span></label>`;
    });

    TRAITS.forEach(t => {
        userTraitContainer.innerHTML += `<label class="checkbox-label"><input type="checkbox" name="trait" value="${t}"><span>${t}</span></label>`;
        prefTraitContainer.innerHTML += `<label class="checkbox-label"><input type="checkbox" name="ptrait" value="${t}"><span>${t}</span></label>`;
    });
}

function runMatchmaking() {
    const name = document.getElementById('name').value;
    const age = parseInt(document.getElementById('age').value);
    const gender = document.getElementById('gender').value;
    const acts = Array.from(document.querySelectorAll('input[name="act"]:checked')).map(i => i.value);
    const traits = Array.from(document.querySelectorAll('input[name="trait"]:checked')).map(i => i.value);
    const prefGender = document.getElementById('prefGender').value;
    const prefTraits = Array.from(document.querySelectorAll('input[name="ptrait"]:checked')).map(i => i.value);

    if (!name || isNaN(age) || !gender || acts.length !== 2 || traits.length !== 3 || prefTraits.length !== 3) {
        alert("Please complete your profile to begin the sync! ✨");
        return;
    }

    const btn = document.getElementById('syncBtn');
    btn.innerText = "Syncing Souls...";
    btn.disabled = true;

    setTimeout(() => {
        const currentUser = { name: name + " 💫", age, gender, activities: acts, traits: traits };
        let results = database.map(person => {
            let score = 0;
            if (prefGender === "Any" || prefGender === person.gender) score += 50;
            acts.forEach(a => { if (person.activities.includes(a)) score += 15; });
            prefTraits.forEach(t => { if (person.traits.includes(t)) score += 35; });
            return { name: person.name, score: score };
        });

        results.sort((a, b) => b.score - a.score);
        database.push(currentUser);
        localStorage.setItem('soulSyncedDB', JSON.stringify(database));

        btn.innerText = "Begin Sync";
        btn.disabled = false;
        displayResults(results);
    }, 1500);
}

function displayResults(results) {
    document.getElementById('matchForm').classList.add('hidden');
    const resDiv = document.getElementById('results');
    const display = document.getElementById('matchDisplay');
    resDiv.classList.remove('hidden');
    
    let html = "";
    results.slice(0, 3).forEach((m, index) => {
        let pct = Math.min(99, Math.max(42, m.score));
        html += `<div class="match-card">
                    <span>${m.name}</span>
                    <strong>${pct}% Match</strong>
                 </div>`;
    });
    display.innerHTML = html;
}

function resetForm() {
    document.getElementById('matchForm').reset();
    document.getElementById('matchForm').classList.remove('hidden');
    document.getElementById('results').classList.add('hidden');
    window.scrollTo(0,0);
}

function clearData() {
    localStorage.removeItem('soulSyncedDB');
    location.reload();
}

createFloatingBackground();
setupForm();
