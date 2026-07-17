/* =========================================================
   DRIFTER: REALMS OF HORIZON
   FULL FIXED FILE — PHASE 1 + PHASE 2
   ========================================================= */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const GRAVITY = 0.4;
const GROUND_HEIGHT = 120;

// GAME STATE
let gameState = "start";
let score = 0;
let worldSpeed = 3;
let difficultyTimer = 0;

// INPUT
let keys = {};
window.addEventListener("keydown", e => {
  keys[e.key] = true;

  if (gameState === "start" && e.key === " ") startGame();
  else if (gameState === "gameover" && e.key === " ") restartGame();
});
window.addEventListener("keyup", e => keys[e.key] = false);

// START / RESTART
function startGame() {
  gameState = "play";
  score = 0;
  worldSpeed = 3;
  difficultyTimer = 0;
}

function restartGame() {
  player.x = spawnPoint.x;
  player.y = spawnPoint.y;
  player.vx = 0;
  player.vy = 0;
  player.onGround = false;
  obstacles = [];
  creatures = [];
  guardians = [];
  spawnCreatures();
  spawnGuardian();
  startGame();
}

// PLAYER
let spawnPoint = {
  x: canvas.width / 2,
  y: canvas.height - GROUND_HEIGHT - 50
};

let player = {
  x: spawnPoint.x,
  y: spawnPoint.y,
  vx: 0,
  vy: 0,
  speed: 0.2,
  friction: 0.90,
  size: 20,
  onGround: false,
  hitbox: { w: 50, h: 40 }
};

// REALMS
let realms = [
  {
    name: "Neon Horizon",
    top: "#0f1c33",
    bottom: "#1a2a4a",
    fog: "rgba(255,255,255,0.05)",
    creatureType: "jellyfish",
    guardianType: "neonFox"
  },
  {
    name: "Nature Realms",
    top: "#1a4a2a",
    bottom: "#2e6f3a",
    fog: "rgba(255,255,255,0.08)",
    creatureType: "birds",
    guardianType: "treeSpirit"
  },
  {
    name: "Cosmic Drift",
    top: "#12001a",
    bottom: "#2a003f",
    fog: "rgba(200,150,255,0.08)",
    creatureType: "stars",
    guardianType: "cosmicWhale"
  },
  {
    name: "Dark Fantasy",
    top: "#0a0a0a",
    bottom: "#1a0f1a",
    fog: "rgba(50,0,50,0.08)",
    creatureType: "wisps",
    guardianType: "shadowSentinel"
  }
];

let currentRealm = 0;

// BACKGROUND OBJECTS
let stars = [];
for (let i = 0; i < 80; i++) {
  stars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 2 + 1,
    speed: 0.01
  });
}

let clouds = [];
for (let i = 0; i < 6; i++) {
  clouds.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    w: 120 + Math.random() * 100,
    h: 40 + Math.random() * 20,
    speed: 0.2 + Math.random() * 0.3,
    opacity: 0.2 + Math.random() * 0.3
  });
}

let islands = [
  { x: 300, y: 200, w: 200, h: 120 },
  { x: 800, y: 400, w: 250, h: 150 },
  { x: 1200, y: 250, w: 180, h: 100 }
];

// OBSTACLES
let obstacles = [];

function spawnObstacle() {
  const groundY = canvas.height - GROUND_HEIGHT;
  const w = 40 + Math.random() * 40;
  const h = 40 + Math.random() * 30;

  const moving = Math.random() < 0.4;

  obstacles.push({
    x: canvas.width + w,
    y: groundY - h,
    w,
    h,
    vx: moving ? (Math.random() * 2 + 1) : 0,
    type: moving ? "moving" : "static"
  });
}

// PARTICLES (misty dust)
let particles = [];

function spawnParticle() {
  particles.push({
    x: player.x - 10,
    y: player.y + 10,
    vx: (Math.random() - 0.5) * 0.5,
    vy: Math.random() * -0.5,
    size: Math.random() * 3 + 1,
    alpha: 1
  });
}

// CREATURES (ambient)
let creatures = [];

function spawnCreatures() {
  creatures = [];
  let realm = realms[currentRealm];

  let count = 8;

  for (let i = 0; i < count; i++) {
    creatures.push({
      type: realm.creatureType,
      x: Math.random() * canvas.width,
      y: Math.random() * (canvas.height - 200),
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: 20 + Math.random() * 20
    });
  }
}

// GUARDIANS (peaceful bosses)
let guardians = [];

function spawnGuardian() {
  guardians = [];
  let realm = realms[currentRealm];

  guardians.push({
    type: realm.guardianType,
    x: canvas.width / 2,
    y: canvas.height / 2 - 100,
    size: 80,
    floatOffset: Math.random() * 100
  });
}

/* =========================================================
   PHASE 2 — MINI-MAP
   ========================================================= */

function drawMiniMap() {
  const mapW = 200;
  const mapH = 120;
  const x = canvas.width - mapW - 20;
  const y = 20;

  ctx.save();

  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.fillRect(x, y, mapW, mapH);

  const boxW = mapW / realms.length;

  for (let i = 0; i < realms.length; i++) {
    ctx.fillStyle = i === currentRealm ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.2)";
    ctx.fillRect(x + i * boxW, y, boxW, 30);

    ctx.fillStyle = "#fff";
    ctx.font = "12px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(realms[i].name, x + i * boxW + boxW / 2, y + 20);
  }

  ctx.fillStyle = "#ffddaa";
  ctx.beginPath();
  ctx.arc(x + (currentRealm + 0.5) * boxW, y + 60, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#aaffff";
  ctx.beginPath();
  ctx.arc(x + (currentRealm + 0.5) * boxW, y + 90, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/* =========================================================
   PHASE 2 — SAVE SYSTEM
   ========================================================= */

function saveGame() {
  const data = {
    realm: currentRealm,
    score: score,
    playerX: player.x,
    playerY: player.y
  };
  localStorage.setItem("drifterSave", JSON.stringify(data));
}

function loadGame() {
  const data = JSON.parse(localStorage.getItem("drifterSave"));
  if (!data) return;

  currentRealm = data.realm ?? 0;
  score = data.score ?? 0;
  player.x = data.playerX ?? spawnPoint.x;
  player.y = data.playerY ?? spawnPoint.y;

  spawnCreatures();
  spawnGuardian();
}

/* =========================================================
   PHASE 2 — MUSIC HOOKS
   ========================================================= */

let currentMusic = null;
let musicFade = 0;

function switchMusic(type) {
  musicFade = -1;

  setTimeout(() => {
    currentMusic = type;
    musicFade = 1;
  }, 500);
}

function updateMusic() {
  // placeholder fade logic
}

/* =========================================================
   DRAW CREATURES
   ========================================================= */

function drawCreature(c) {
  ctx.save();
  ctx.translate(c.x, c.y);

  if (c.type === "jellyfish") {
    ctx.fillStyle = "rgba(255,150,255,0.7)";
    ctx.beginPath();
    ctx.ellipse(0, 0, c.size, c.size * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  if (c.type === "birds") {
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.beginPath();
    ctx.moveTo(-c.size * 0.5, 0);
    ctx.lineTo(0, -c.size * 0.3);
    ctx.lineTo(c.size * 0.5, 0);
    ctx.stroke();
  }

  if (c.type === "stars") {
    ctx.fillStyle = "rgba(200,150,255,0.9)";
    ctx.beginPath();
    ctx.arc(0, 0, c.size * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  if (c.type === "wisps") {
    ctx.fillStyle = "rgba(80,0,80,0.5)";
    ctx.beginPath();
    ctx.ellipse(0, 0, c.size * 0.4, c.size * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/* =========================================================
   DRAW GUARDIANS
   ========================================================= */

function drawGuardian(g) {
  ctx.save();
  ctx.translate(g.x, g.y + Math.sin(Date.now() / 1000 + g.floatOffset) * 10);

  if (g.type === "neonFox") {
    ctx.fillStyle = "rgba(255,150,80,0.8)";
    ctx.beginPath();
    ctx.ellipse(0, 0, g.size, g.size * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  if (g.type === "treeSpirit") {
    ctx.fillStyle = "rgba(80,150,80,0.8)";
    ctx.beginPath();
    ctx.ellipse(0, 0, g.size * 0.8, g.size, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  if (g.type === "cosmicWhale") {
    ctx.fillStyle = "rgba(150,80,255,0.7)";
    ctx.beginPath();
    ctx.ellipse(0, 0, g.size * 1.5, g.size * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  if (g.type === "shadowSentinel") {
    ctx.fillStyle = "rgba(40,0,40,0.7)";
    ctx.beginPath();
    ctx.ellipse(0, 0, g.size * 0.5, g.size * 1.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/* =========================================================
   DRAW PLAYER
   ========================================================= */

function drawPlayer() {
  ctx.save();

  let bob = Math.sin(Date.now() / 200) * 2;
  let stretch = 1 + Math.sin(Date.now() / 120) * 0.05;

  ctx.translate(player.x, player.y + bob);
  ctx.scale(stretch, 1);

  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.beginPath();
  ctx.ellipse(0, 25, 28, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowColor = "#ffa866";
  ctx.shadowBlur = 25;

  ctx.fillStyle = "#ff8c42";
  ctx.beginPath();
  ctx.ellipse(0, 0, 25, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;

  ctx.strokeStyle = "#000";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = "#ff8c42";
  ctx.beginPath();
  ctx.ellipse(0, -22, 16, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(-10, -28);
  ctx.lineTo(-4, -40);
  ctx.lineTo(2, -28);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(10, -28);
  ctx.lineTo(4, -40);
  ctx.lineTo(-2, -28);
  ctx.fill();

  ctx.fillStyle = "#ffb46a";
  ctx.beginPath();
  ctx.ellipse(-30, 5, 20, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/* =========================================================
   DRAW OBSTACLES
   ========================================================= */

function drawObstacle(o) {
  ctx.save();

  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.fillRect(o.x + 10, o.y + o.h, o.w, 10);

  ctx.fillStyle = "#3a4a63";
  ctx.fillRect(o.x, o.y, o.w, o.h);

  ctx.strokeStyle = "#000";
  ctx.lineWidth = 3;
  ctx.strokeRect(o.x, o.y, o.w, o.h);

  ctx.fillStyle = "rgba(255,255,255,0.15)";
  ctx.fillRect(o.x, o.y, o.w, 8);

  ctx.restore();
}

/* =========================================================
   UPDATE CREATURES / PARTICLES / OBSTACLES
   ========================================================= */

function updateCreatures() {
  for (let c of creatures) {
    c.x += c.vx;
    c.y += c.vy;

     function updateCreatures() {
  for (let c of creatures) {
    c.x += c.vx;
    c.y += c.vy;

    if (c.x < -50) c.x = canvas.width + 50;
    if (c.x > canvas.width + 50) c.x = -50;
    if (c.y < 0) c.y = canvas.height;
    if (c.y > canvas.height) c.y = 0;
  }
}
