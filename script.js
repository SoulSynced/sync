var ACTIVITIES = ["Watching TV/Playing Games", "Window Shopping at the Mall", "Picnic at the Park", "Going on Hikes", "Going out to Eat"];
var TRAITS = ["Funny", "Kind", "Creative", "Calm", "Outgoing", "Adventurous", "Ambitious", "Honest", "Loyal", "Academic"];
var HOBBIES = ["Art", "Music", "Gym", "Sleeping", "Cooking/Baking", "DoomScrolling", "People Watching"];
var HUMOR = ["Silly Jokes", "Dark Humor", "Dad Jokes", "Chronically Online", "Satire"];
var JOBS = ["Engineer", "Doctor", "Lawyer", "Mcdonald's Worker", "Not Real Job L"];
var GENRE = ["Horror/Psychological Thriller", "Comedy", "Action", "Romance", "Drama", "Anime"];
var LOVELANG = ["Words of Affirmation", "Physical Touch", "Giving/Receiving Gifts", "Quality Time", "Acts of Service"];
var EMOJIS = ["💖", "✨", "💜", "💫", "🌸", "☁️", "🩵"];

var starterPack = [
    { 
        name: "Luna", age: 16, gender: "Female", job: "Not Real Job L", contact: "Insta: @luna_stays_home",
        activities: ["Going on Hikes", "Going out to Eat"], 
        traits: ["Adventurous", "Academic", "Funny"],
        hobbies: ["Art", "Music"], humor: "Satire", genre: "Anime", loveLang: "Quality Time"
    },
    { 
        name: "Kai", age: 19, gender: "Male", job: "Engineer", contact: "Discord: kai_codez",
        activities: ["Watching TV/Playing Games", "Going out to Eat"], 
        traits: ["Calm", "Honest", "Creative"],
        hobbies: ["Gym", "Cooking/Baking"], humor: "Dark Humor", genre: "Horror/Psychological Thriller", loveLang: "Physical Touch"
    },
    { 
        name: "Bob", age: 16, gender: "Other", job: "Mcdonald's Worker", contact: "Snap: bobthebuilder",
        activities: ["Window Shopping at the Mall", "Picnic at the Park"], 
        traits: ["Outgoing", "Kind", "Loyal"],
        hobbies: ["Music", "People Watching"], humor: "Silly Jokes", genre: "Romance", loveLang: "Quality Time"
    }
];

var database = JSON.parse(localStorage.getItem("soulSyncedDB"));
if (database == null) {
    database = starterPack;
}

function setupForm() {
    var genderSelect = document.getElementById("gender");
    genderSelect.innerHTML = "<option value='' disabled selected>Your Identity</option><option value='Male'>Male</option><option value='Female'>Female</option><option value='Other'>Other</option>";

    var prefGenderSelect = document.getElementById("prefGender");
    prefGenderSelect.innerHTML = "<option value='' disabled selected>Seeking...</option><option value='Male'>Male</option><option value='Female'>Female</option><option value='Other'>Other</option><option value='Any'>Open to All</option>";

    var lists = ["activityList", "userTraitList", "prefTraitList", "hobbyList", "humorList", "genreList", "loveLangList"];
    var dataArrays = [ACTIVITIES, TRAITS, TRAITS, HOBBIES, HUMOR, GENRE, LOVELANG];
    var names = ["act", "trait", "ptrait", "hobby", "humor", "genre", "loveLang"];

    for (var i = 0; i < lists.length; i++) {
        var el = document.getElementById(lists[i]);
        var type = "checkbox";
        if (i >= 4) { type = "radio"; }
        
        var html = "";
        for (var j = 0; j < dataArrays[i].length; j++) {
            var val = dataArrays[i][j];
            html += "<label class='checkbox-label'><input type='" + type + "' name='" + names[i] + "' value='" + val + "'><span>" + val + "</span></label>";
        }
        el.innerHTML = html;
    }

    var jobSelect = document.getElementById("job");
    var jobHtml = "<option value='' disabled selected>Career</option>";
    for (var k = 0; k < JOBS.length; k++) {
        jobHtml += "<option value='" + JOBS[k] + "'>" + JOBS[k] + "</option>";
    }
    jobSelect.innerHTML = jobHtml;
}

function runMatchmaking() {
    var userName = document.getElementById("name").value;
    var userAge = parseInt(document.getElementById("age").value);
    var userGender = document.getElementById("gender").value;
    var userJob = document.getElementById("job").value;
    var userContact = document.getElementById("contact").value;
    var prefGender = document.getElementById("prefGender").value;
    var minAge = parseInt(document.getElementById("minAge").value);
    var maxAge = parseInt(document.getElementById("maxAge").value);

    function getSelected(name) {
        var selected = [];
        var inputs = document.getElementsByName(name);
        for (var i = 0; i < inputs.length; i++) {
            if (inputs[i].checked) { selected.push(inputs[i].value); }
        }
        return selected;
    }

    var userAct = getSelected("act");
    var userTrait = getSelected("trait");
    var userHobby = getSelected("hobby");
    var userHumor = getSelected("humor")[0];
    var userGenre = getSelected("genre")[0];
    var userLove = getSelected("loveLang")[0];
    var prefTraits = getSelected("ptrait");

    if (!userName || !userAge || !minAge || !maxAge || !userContact || userAct.length == 0) {
        alert("Please fill in your profile and age preferences! ✨"); 
        return;
    }

    var btn = document.getElementById("syncBtn");
    btn.innerText = "Finding match...";
    btn.disabled = true;

    setTimeout(function() {
        var results = [];
        for (var i = 0; i < database.length; i++) {
            var person = database[i];
            var score = 0;

            if (person.age >= minAge && person.age <= maxAge) {
                score += 20; 
            } else {
                continue; 
            }

            if (prefGender == "Any" || prefGender == person.gender) { score += 30; }
            
            for (var a = 0; a < userAct.length; a++) {
                if (person.activities.indexOf(userAct[a]) != -1) { score += 10; }
            }
            for (var t = 0; t < prefTraits.length; t++) {
                if (person.traits.indexOf(prefTraits[t]) != -1) { score += 15; }
            }
            
            if (userHumor == person.humor) { score += 10; }
            if (userGenre == person.genre) { score += 10; }

            person.matchScore = Math.min(99, score);
            results.push(person);
        }

        results.sort(function(a, b) { return b.matchScore - a.matchScore; });

        var newUser = {
            name: userName + " 💫", age: userAge, gender: userGender, job: userJob, contact: userContact,
            activities: userAct, traits: userTrait, hobbies: userHobby, humor: userHumor, genre: userGenre, loveLang: userLove
        };
        database.push(newUser);
        localStorage.setItem("soulSyncedDB", JSON.stringify(database));

        btn.innerText = "Begin Sync";
        btn.disabled = false;
        displayResults(results, newUser);
    }, 1500);
}

function displayResults(results, currentUser) {
    document.getElementById("matchForm").classList.add("hidden");
    document.getElementById("results").classList.remove("hidden");
    var display = document.getElementById("matchDisplay");
    display.innerHTML = "";

    var count = 0;
    for (var i = 0; i < results.length; i++) {
        var m = results[i];
        if (m.name != currentUser.name && count < 3) {
            var card = document.createElement("div");
            card.className = "match-card";
            card.innerHTML = "<span>" + m.name + "</span><strong>" + m.matchScore + "% Match</strong>";
            card.onclick = (function(person) {
                return function() { showModal(person, currentUser); };
            })(m);
            display.appendChild(card);
            count++;
        }
    }
}

function showModal(person, user) {
    var modal = document.getElementById("profileModal");
    var body = document.getElementById("modalBody");
    var common = [];
    
    for (var i = 0; i < person.activities.length; i++) {
        if (user.activities.indexOf(person.activities[i]) != -1) { common.push(person.activities[i]); }
    }
    for (var j = 0; j < person.traits.length; j++) {
        if (user.traits.indexOf(person.traits[j]) != -1) { common.push(person.traits[j]); }
    }

    var commonHtml = "";
    for (var k = 0; k < common.length; k++) {
        commonHtml += "<span class='common-tag' style='margin:0;'>" + common[k] + "</span>";
    }

    body.innerHTML = "<h2 style='font-family:Pacifico, cursive; color:var(--primary);'>" + person.name + "</h2>" +
        "<p><strong>" + person.age + "</strong> — " + person.job + "</p>" +
        "<div style='background:#f0edff; padding:20px; border-radius:15px; border:2px dashed var(--primary);'>" +
        "<p style='font-size:0.7rem; color:var(--primary); text-transform:uppercase;'>Contact Info</p>" +
        "<p style='font-weight:600; font-size:1.2rem;'>" + person.contact + "</p></div>" +
        "<div style='text-align:left; margin-top:20px;'><p style='font-size:0.8rem; color:#666;'>Common Vibes:</p>" +
        "<div style='display:flex; flex-wrap:wrap; gap:8px;'>" + (commonHtml || "Matching Soul") + "</div></div>";
    
    modal.classList.remove("hidden");
}

function closeModal() { document.getElementById("profileModal").classList.add("hidden"); }
function resetForm() { location.reload(); }
function clearData() { localStorage.removeItem("soulSyncedDB"); location.reload(); }

function createFloatingBackground() {
    var container = document.getElementById("emoji-container");
    if (!container) return;
    for (var i = 0; i < 20; i++) {
        var span = document.createElement("span");
        span.className = "floating-emoji";
        span.innerText = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
        span.style.left = (Math.random() * 100) + "vw";
        span.style.animationDelay = (Math.random() * 15) + "s";
        container.appendChild(span);
    }
}

createFloatingBackground();
setupForm();
