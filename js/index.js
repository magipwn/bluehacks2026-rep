let currentItemName = null;   
let carbonEmissionSaved = parseInt(sessionStorage.getItem("carbonEmissionSaved")) || 0;
const camera = document.getElementById('camera');
const scanBtn = document.getElementById('scan-btn');
const URL = "https://teachablemachine.withgoogle.com/models/PKzQi2Edc/";
let model;

async function loadModel() {
    model = await tmImage.load(URL + "model.json", URL + "metadata.json");
}

async function setupCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        camera.srcObject = stream;
    } catch (err) { console.log("Camera Access Denied."); }
}

/* --- MODAL SELECTORS --- */
const container = document.getElementById("container");
const wb = document.getElementById("wb");
const pcp = document.getElementById("pcp");
const pc = document.getElementById("pc");
const s = document.getElementById("s");
const pt = document.getElementById("pt");
const close = document.getElementById("x");
const threw = document.getElementById("threw");
const note1 = document.getElementById("note");
const img = document.getElementById("item_img");
const binImg = document.getElementById("bin_img");
const title = document.getElementById("item_title");
const binText = document.getElementById("item_bin");
const desc = document.getElementById("item_desc");

const congrats = document.getElementById("congratsbtn");
const wbCe = document.getElementById("waterbottleCE");
const pcCe = document.getElementById("papercontainerCE");
const gen = document.getElementById("general");

//CLOSE MODAL
close.addEventListener("click", () => {
    container.style.display = "none";

    const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
    if (user && currentItemName) {
        addScannedItem(user, currentItemName, itemEmojiMap[currentItemName] || "♻️");
    }

    // Show congrats modal only for Plastic Bottle
    if (currentItemName === "Plastic Bottle") {
        wbCe.style.display = "flex";
        carbonEmissionSaved += 35;
        sessionStorage.setItem("carbonEmissionSaved", carbonEmissionSaved);

    } else if (currentItemName === "Paper Container") {
        pcCe.style.display = "flex";
        carbonEmissionSaved += 36;  
        sessionStorage.setItem("carbonEmissionSaved", carbonEmissionSaved);  

    } else {
        gen.style.display = "flex";
    }

});

const congratsButtons = document.querySelectorAll(".congratsbtn");

// Tell each button to hide all modals when clicked
congratsButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        wbCe.style.display = "none";
        pcCe.style.display = "none";
        gen.style.display = "none";
    });
});


/* --- MODAL OPEN FUNCTION --- */
function openModal(data) {
    img.src = data.img;
    binImg.src = data.binImg;
    title.textContent = data.title;
    binText.textContent = data.bin;
    img.style.transform = "translate(-50%,-50%) rotate(0deg)";
    binText.style.color = data.color;
    note1.style.color = data.color;
    desc.innerHTML = `
        <b>Material:</b> ${data.material} <br>
        <b>Time to Decompose:</b> ${data.time} <br>
        <p class="note"><b>Note:</b> ${data.note}</p>
    `;
    container.style.display = "flex";
}

/* --- ITEM BUTTON LISTENERS --- */
wb.addEventListener("click", () => {
    currentItemName = "Plastic Bottle";   
    openModal({
        img: "img/water_bottle.png",
        color: "#326cd0",
        binImg: "img/recyclable.png",
        title: "Plastic Bottle",
        bin: "Recyclable",
        material: "Plastic",
        time: "20 to 500 years",
        note: "Make sure to empty all liquids!"
    });
    img.style.transform = "translate(-50%,-50%) rotate(45deg)";
});

pcp.addEventListener("click", () => {
    currentItemName = "Paper Cup";
    openModal({
        img: "img/papercup.png",
        binImg: "img/residual.png",
        color: "#7a8d90",
        title: "Paper Cup",
        bin: "General/Residual/Non-Biodegradable",
        material: "Paper + Plastic lining",
        time: "20 to 30 years",
        note: "Cannot be recycled due to plastic lining"
    });
    img.style.transform = "translate(-50%,-50%) scale(0.8)";
});

pc.addEventListener("click", () => {
    currentItemName = "Paper Container";
    openModal({
        img: "img/pcont.png",
        binImg: "img/recyclable.png",
        color: "#326cd0",
        title: "Paper Container",
        bin: "General/Residual/Non-Biodegradable",
        material: "Paperboard",
        time: "2 to 6 weeks",
        note: "Clean before recycling!"
    });
});

s.addEventListener("click", () => {
    currentItemName = "Snack Wrapper";
    openModal({
        img: "img/snacks.png",
        color: "#7a8d90",
        binImg: "img/residual.png",
        title: "Snack Wrapper",
        bin: "General/Residual/Non-Biodegradable",
        material: "Mixed plastics",
        time: "100+ years",
        note: "Not recyclable in most facilities"
    });
    img.style.transform = "translate(-50%,-50%) scale(0.65)";
});

pt.addEventListener("click", () => {
    currentItemName = "Napkin";
    openModal({
        img: "img/ptowel.png",
        binImg: "img/compostable.png",
        color: "#45846e",
        title: "Napkin",
        bin: "Compostable",
        material: "Plant-base materials/Cellulose Fibers",
        time: "2 to 4 weeks",
        note: "Their fibers too short to be recyclable"
    });
    img.style.transform = "translate(-50%,-50%) scale(0.65)";
});

/* --- AI SCAN LOGIC --- */
const itemEmojiMap = {
    "Plastic Bottle":      "🍶",
    "Paper Cup":         "☕",
    "Napkin":            "🧻",
    "Paper Container":   "🗂️",
    "Snack Wrapper":     "🍟",
};

const aiToButtonMap = {
    "Plastic Bottle": wb,
    "Paper Cup": pcp,
    "Napkin": pt,
    "Paper Container": pc,
    "Snack Wrapper": s
};


scanBtn.addEventListener('click', async () => {
    const prediction = await model.predict(camera);
    const currentBest = prediction.sort((a, b) => b.probability - a.probability)[0];

    if (currentBest.probability > 0.80) {
        const targetButton = aiToButtonMap[currentBest.className];
        if (targetButton) targetButton.click();
    } else {
        alert("Item not recognized. Try again!");
    }
});

/* --- INITIALIZE --- */
setupCamera();
loadModel();