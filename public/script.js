const tg = window.Telegram.WebApp;
tg.expand();

// --- CONFIGURATION IMAGES ---
const assets = {
    idle: "assets/duck-main.gif",
    tap: "assets/duck-earn.gif",
    sleep: "assets/duck-sleep.gif",
    done: "assets/duck-done.gif"
};

// --- VARIABLES DU JEU ---
let balance = 0;
let energy = 1000;
let maxEnergy = 1000;
let tapValue = 1;
let energyRegen = 2; // Récupère 2 énergies par seconde

// Niveaux Boosts
let multitapLevel = 1;
let energyLimitLevel = 1;

const costs = { multitap: 500, limit: 500 };

// DOM Elements
const balanceEl = document.getElementById('score');
const energyEl = document.getElementById('energy');
const maxEnergyEl = document.getElementById('max-energy');
const fillEl = document.getElementById('energy-fill');
const duckImg = document.getElementById('duck-img');
const clickPad = document.getElementById('click-pad');

// --- SYSTÈME DE TAP ET ANIMATION ---

// Fonction pour déterminer l'état du canard (Idle ou Sleep)
function getIdleState() {
    // Si l'énergie est inférieure à 20%, le canard dort
    if (energy < (maxEnergy * 0.2)) {
        return assets.sleep;
    }
    return assets.idle;
}

clickPad.addEventListener('pointerdown', (e) => {
    e.preventDefault(); 
    
    if (energy >= tapValue) {
        // 1. CHANGEMENT D'IMAGE (Tap)
        duckImg.src = assets.tap;
        
        // 2. LOGIQUE JEU
        balance += tapValue;
        energy -= tapValue;
        
        // Haptic Feedback
        if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('medium');

        updateUI();
        
        // Animation chiffre flottant
        const x = e.clientX || e.touches[0].clientX;
        const y = e.clientY || e.touches[0].clientY;
        showFloatingNumber(x, y);

        // 3. RETOUR A L'IMAGE NORMALE (après un court délai)
        clearTimeout(window.duckTimeout);
        window.duckTimeout = setTimeout(() => {
            duckImg.src = getIdleState();
        }, 150); // Reste en mode "earn" pendant 150ms
    } else {
        // Pas assez d'énergie ? Animation d'erreur ou vibration
        if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('error');
    }
});

function showFloatingNumber(x, y) {
    const floatNum = document.createElement('div');
    floatNum.className = 'floating-num';
    floatNum.innerText = `+${tapValue}`;
    floatNum.style.left = `${x}px`;
    floatNum.style.top = `${y}px`;
    document.body.appendChild(floatNum);
    setTimeout(() => floatNum.remove(), 800);
}

// --- RÉGÉNÉRATION ---
setInterval(() => {
    if (energy < maxEnergy) {
        energy += energyRegen;
        if (energy > maxEnergy) energy = maxEnergy;
        updateUI();
        
        // Si le canard ne fait rien, on vérifie s'il doit se réveiller ou dormir
        // On ne change l'image que si l'utilisateur n'est pas en train de taper
        if (!duckImg.src.includes('duck-earn.gif')) {
             duckImg.src = getIdleState();
        }
    }
}, 1000);

function updateUI() {
    balanceEl.innerText = balance.toLocaleString();
    energyEl.innerText = Math.floor(energy);
    maxEnergyEl.innerText = maxEnergy;
    
    const pct = (energy / maxEnergy) * 100;
    fillEl.style.width = `${pct}%`;
    
    // Met à jour le solde dans l'onglet boost
    const boostBal = document.getElementById('boost-balance');
    if(boostBal) boostBal.innerText = balance.toLocaleString();
}

// --- NAVIGATION ---
window.switchTab = function(tabName, btnElement) {
    document.querySelectorAll('.page-section').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
    document.getElementById(`section-${tabName}`).style.display = 'flex';
    btnElement.classList.add('active');
}

// --- BOOSTS ---
window.buyBoost = function(type) {
    const cost = costs[type];
    if (balance >= cost) {
        balance -= cost;
        costs[type] = Math.floor(cost * 1.5);
        
        if (type === 'multitap') {
            multitapLevel++;
            tapValue++;
            document.getElementById('multitap-lvl').innerText = `Lvl ${multitapLevel}`;
            document.getElementById('multitap-cost').innerText = `${costs[type]}`;
        } else if (type === 'limit') {
            energyLimitLevel++;
            maxEnergy += 500;
            document.getElementById('limit-lvl').innerText = `Lvl ${energyLimitLevel}`;
            document.getElementById('limit-cost').innerText = `${costs[type]}`;
        }
        updateUI();
        if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
    } else {
        if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('error');
    }
}

// --- TASKS ---
window.completeTask = function(element, reward) {
    if (!element.classList.contains('completed')) {
        // Afficher le GIF "done" temporairement au milieu de l'écran ou changer l'icône
        const icon = element.querySelector('.task-icon');
        const originalIcon = icon.innerHTML;
        
        // Simuler un chargement puis validation
        icon.innerHTML = `<img src="${assets.done}" width="30">`;
        
        setTimeout(() => {
             balance += reward;
            element.classList.add('completed');
            element.style.opacity = '0.5';
            element.querySelector('.task-info small').innerText = 'Completed ✅';
            updateUI();
            if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
        }, 1500);
    }
}

window.inviteFren = function() {
    const inviteLink = `https://t.me/share/url?url=https://t.me/Ducksmajor_bot?start=fren`;
    tg.openTelegramLink(inviteLink);
}

window.connectWallet = function() {
    alert("Connect Wallet: Coming Soon!");
}

// Initialisation
updateUI();
duckImg.src = assets.idle; // Force l'image de départ
