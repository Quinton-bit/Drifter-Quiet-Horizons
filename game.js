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

  // FIXED HITBOX (matches fox model)
  hitbox: { w: 50, h: 40 }
};

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

let parallaxLayers = [
  { speed: 0.01, color: "rgba(255,255,255,0.05)", offset: 0 },
  { speed: 0.03, color: "rgba(255,255,255,0.08)", offset: 0 }
];

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
  { x: 300, y: 200, w: 200, h: 120, color: "#4a6fa5" },
  { x: 800, y: 400, w: 250, h: 150, color: "#5b8bbd" },
  { x: 1200, y: 250, w: 180, h: 100, color: "#6fa8dc" }
];

// OBSTACLES
let obstacles = [];

function spawnObstacle() {
  const groundY = canvas.height - GROUND_HEIGHT;
  const w = 40 + Math.random() * 40;
  const h = 40 + Math.random() * 30;

  obstacles.push({
    x: canvas.width + w,
    y: groundY - h,
    w,
    h
  });
}

// UPDATE LOOP
function update() {
  updateBackground();

  if (gameState !== "play") return;

  // gravity + movement
  player.vy += GRAVITY;

  if (keys["a"]) player.vx -= player.speed;
  if (keys["d"]) player.vx += player.speed;

  if (keys["w"] && player.onGround) {
    player.vy = -10;
    player.onGround = false;
  }

  player.vx *= player.friction;
  player.x += player.vx;
  player.y += player.vy;

  let groundY = canvas.height - GROUND_HEIGHT;
  if (player.y + player.size > groundY) {
    player.y = groundY - player.size;
    player.vy = 0;
    player.onGround = true;
  }

  // keep player on screen
  if (player.x < 40) player.x = 40;
  if (player.x > canvas.width - 40) player.x = canvas.width - 40;

  // difficulty scaling
  difficultyTimer += 1;
  if (difficultyTimer % 180 === 0) worldSpeed += 0.4;

  // spawn obstacles
  if (Math.random() < 0.02) spawnObstacle();

  updateObstacles();

  score += 0.1;
}

// BACKGROUND UPDATE
function updateBackground() {
  for (let s of stars) {
    s.x += s.speed;
    if (s.x > canvas.width) {
      s.x = 0;
      s.y = Math.random() * canvas.height;
    }
  }

  for (let layer of parallaxLayers) {
    layer.offset += layer.speed;
    if (layer.offset > canvas.width) layer.offset = 0;
  }

  for (let cloud of clouds) {
    cloud.x += cloud.speed;
    if (cloud.x > canvas.width + cloud.w) {
      cloud.x = -cloud.w;
      cloud.y = Math.random() * canvas.height;
    }
  }

  for (let island of islands) {
    island.x += Math.sin(Date.now() / 2000) * 0.1;
  }
}

// 2.5D PLAYER MODEL
function drawPlayer() {
  ctx.save();

  let bob = Math.sin(Date.now() / 200) * 2;
  let stretch = 1 + Math.sin(Date.now() / 120) * 0.05;

  ctx.translate(player.x, player.y + bob);
  ctx.scale(stretch, 1);

  // SHADOW
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.beginPath();
  ctx.ellipse(0, 25, 28, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // GLOW
  ctx.shadowColor = "#ffa866";
  ctx.shadowBlur = 25;

  // BODY
  ctx.fillStyle = "#ff8c42";
  ctx.beginPath();
  ctx.ellipse(0, 0, 25, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;

  // OUTLINE
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 3;
  ctx.stroke();

  // HEAD
  ctx.fillStyle = "#ff8c42";
  ctx.beginPath();
  ctx.ellipse(0, -22, 16, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  // EARS
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

  // TAIL
  ctx.fillStyle = "#ffb46a";
  ctx.beginPath();
  ctx.ellipse(-30, 5, 20, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// 2.5D OBSTACLE DRAW
function drawObstacle(o) {
  ctx.save();

  // Depth shadow
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.fillRect(o.x + 10, o.y + o.h, o.w, 10);

  // Main body
  ctx.fillStyle = "#3a4a63";
  ctx.fillRect(o.x, o.y, o.w, o.h);

  // Outline
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 3;
  ctx.strokeRect(o.x, o.y, o.w, o.h);

  // Top highlight
  ctx.fillStyle = "rgba(255,255,255,0.15)";
  ctx.fillRect(o.x, o.y, o.w, 8);

  ctx.restore();
}

// OBSTACLE UPDATE + FIXED COLLISION
function updateObstacles() {
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const o = obstacles[i];
    o.x -= worldSpeed;

    if (o.x + o.w < 0) {
      obstacles.splice(i, 1);
      continue;
    }

    // FIXED HITBOX COLLISION
    const px = player.x - player.hitbox.w / 2;
    const py = player.y - player.hitbox.h / 2;
    const pw = player.hitbox.w;
    const ph = player.hitbox.h;

    if (
      px < o.x + o.w &&
      px + pw > o.x &&
      py < o.y + o.h &&
      py + ph > o.y
    ) {
      gameState = "gameover";
    }
  }
}

// DRAW EVERYTHING
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // background gradient
  let gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#0f1c33");
  gradient.addColorStop(1, "#1a2a4a");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // parallax mist
  for (let layer of parallaxLayers) {
    ctx.fillStyle = layer.color;
    ctx.fillRect(layer.offset, 0, canvas.width, canvas.height);
  }

  // ground
  ctx.fillStyle = "#2e3b55";
  ctx.fillRect(0, canvas.height - GROUND_HEIGHT, canvas.width, GROUND_HEIGHT);

  // clouds
  for (let cloud of clouds) {
    ctx.fillStyle = `rgba(255, 255, 255, ${cloud.opacity})`;
    ctx.beginPath();
    ctx.ellipse(cloud.x, cloud.y, cloud.w, cloud.h, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // islands
  for (let island of islands) {
    ctx.fillStyle = island.color;
    let depthScale = island.y / canvas.height;
    let scale = 0.6 + depthScale * 0.4;

    ctx.beginPath();
    ctx.ellipse(
      island.x,
      island.y,
      island.w * scale,
      island.h * scale,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // stars
  for (let s of stars) {
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fill();
  }

  // obstacles
  for (let o of obstacles) drawObstacle(o);

  // player
  drawPlayer();

  // UI
  ctx.fillStyle = "#e5e7eb";
  ctx.font = "20px system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("Score: " + Math.floor(score), 30, 40);

  ctx.textAlign = "center";
  ctx.font = "28px system-ui, sans-serif";

  if (gameState === "start") {
    ctx.fillText("DRIFTER: QUIET HORIZONS", canvas.width / 2, canvas.height / 2 - 40);
    ctx.font = "20px system-ui, sans-serif";
    ctx.fillText("Press SPACE to begin", canvas.width / 2, canvas.height / 2 + 10);
    ctx.fillText("W to jump, A/D to move", canvas.width / 2, canvas.height / 2 + 40);
  } else if (gameState === "gameover") {
    ctx.fillText("You drifted: " + Math.floor(score) + " m", canvas.width / 2, canvas.height / 2 - 10);
    ctx.font = "20px system-ui, sans-serif";
    ctx.fillText("Press SPACE to try again", canvas.width / 2, canvas.height / 2 + 30);
  }
}

// GAME LOOP
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
