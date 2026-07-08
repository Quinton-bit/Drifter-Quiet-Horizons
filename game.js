const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const GRAVITY = 0.4;
const GROUND_HEIGHT = 120;

let spawnPoint = {
  x: canvas.width / 2,
  y: canvas.height - GROUND_HEIGHT - 50
};

// PLAYER
let player = {
  x: spawnPoint.x,
  y: spawnPoint.y,
  vx: 0,
  vy: 0,
  speed: 0.2,
  friction: 0.90,
  size: 20,
  onGround: false
};


let keys = {};
window.addEventListener("keydown", e => keys[e.key] = true);
window.addEventListener("keyup", e => keys[e.key] = false);

let stars = [];
for (let i = 0; i < 80; i++) {
  stars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 2 + 1,
    speed: 0.01

  });
}

// CLOUDS
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

// ISLANDS
let islands = [
  { x: 300, y: 200, w: 200, h: 120, color: "#4a6fa5" },
  { x: 800, y: 400, w: 250, h: 150, color: "#5b8bbd" },
  { x: 1200, y: 250, w: 180, h: 100, color: "#6fa8dc" }
];

// UPDATE LOOP
function update() {

  // PLAYER MOVEMENT
  // APPLY GRAVITY
player.vy += GRAVITY;

// LEFT / RIGHT MOVEMENT
if (keys["a"]) player.vx -= player.speed;
if (keys["d"]) player.vx += player.speed;

// JUMP
if (keys["w"] && player.onGround) {
  player.vy = -10;
  player.onGround = false;
}

// APPLY FRICTION
player.vx *= player.friction;

// UPDATE POSITION
player.x += player.vx;
player.y += player.vy;

// GROUND COLLISION
let groundY = canvas.height - GROUND_HEIGHT;

if (player.y + player.size > groundY) {
  player.y = groundY - player.size;
  player.vy = 0;
  player.onGround = true;
}
// STAR MOVEMENT (parallax)
for (let s of stars) {
  s.x += s.speed;
  if (s.x > canvas.width) {
    s.x = 0;
    s.y = Math.random() * canvas.height;
  }
}

  // CLOUD MOVEMENT
  for (let cloud of clouds) {
    cloud.x += cloud.speed;
    if (cloud.x > canvas.width + cloud.w) {
      cloud.x = -cloud.w;
      cloud.y = Math.random() * canvas.height;
    }
  }

  // ISLAND DRIFT
  for (let island of islands) {
    island.x += Math.sin(Date.now() / 2000) * 0.1;
  }
}
function drawPlayer() {
  ctx.save();

  // body
  ctx.fillStyle = "#a03320";
  ctx.beginPath();
  ctx.ellipse(player.x, player.y, 20, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  // head
  ctx.beginPath();
  ctx.ellipse(player.x, player.y - 18, 14, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // ears
  ctx.beginPath();
  ctx.moveTo(player.x - 10, player.y - 22);
  ctx.lineTo(player.x - 4, player.y - 32);
  ctx.lineTo(player.x + 0, player.y - 22);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(player.x + 10, player.y - 22);
  ctx.lineTo(player.x + 4, player.y - 32);
  ctx.lineTo(player.x + 0, player.y - 22);
  ctx.fill();

  ctx.restore();
}

// DRAW LOOP
function draw() {
 ctx.clearRect(0, 0, canvas.width, canvas.height);
  // BACKGROUND
  
  // BACKGROUND GRADIENT
let gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
gradient.addColorStop(0, "#0f1c33");  // top color
gradient.addColorStop(1, "#1a2a4a");  // bottom color

ctx.fillStyle = gradient;
ctx.fillRect(0, 0, canvas.width, canvas.height);


  // GROUND
ctx.fillStyle = "#2e3b55";
ctx.fillRect(0, canvas.height - GROUND_HEIGHT, canvas.width, GROUND_HEIGHT);
  
// CLOUDS
  for (let cloud of clouds) {
    ctx.fillStyle = `rgba(255, 255, 255, ${cloud.opacity})`;
    ctx.beginPath();
    ctx.ellipse(cloud.x, cloud.y, cloud.w, cloud.h, 0, 0, Math.PI * 2);
    ctx.fill();
  }// CLEAR CANVAS   
  
let stars = [];
for (let i = 0; i < 80; i++) {
  stars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 1 + 1,
    speed: 0.01
  });
}

  // ISLANDS
  for (let island of islands) {
    ctx.fillStyle = island.color;
    ctx.beginPath();
    ctx.ellipse(island.x, island.y, island.w, island.h, 0, 0, Math.PI * 2);
    ctx.fill();
  }
// STARS
for (let s of stars) {
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
  ctx.fill();
}

  drawPlayer();
}

// MAIN LOOP
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
