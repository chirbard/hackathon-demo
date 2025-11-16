const canvas = document.getElementById("controlCanvas");
const ctx = canvas.getContext("2d");
const directionDisplay = document.getElementById("direction");
const intensityDisplay = document.getElementById("intensity");

const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const radius = 180;

let mouseX = centerX;
let mouseY = centerY;

// Server URL - change this to match your setup
const SERVER_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : `http://${window.location.hostname}:3000`;

function drawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw outer circle
  ctx.strokeStyle = "#00ff88";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.stroke();

  // Draw center point
  ctx.fillStyle = "#00ff88";
  ctx.beginPath();
  ctx.arc(centerX, centerY, 5, 0, 2 * Math.PI);
  ctx.fill();

  // Draw current position
  ctx.fillStyle = "#ff4444";
  ctx.beginPath();
  ctx.arc(mouseX, mouseY, 8, 0, 2 * Math.PI);
  ctx.fill();

  // Draw line from center to current position
  ctx.strokeStyle = "#ff4444";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(mouseX, mouseY);
  ctx.stroke();
}

function calculateValues(x, y) {
  const deltaX = x - centerX;
  const deltaY = y - centerY;
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

  // Calculate direction (0 = north, 90 = east, 180 = south, 270 = west)
  let direction = Math.atan2(deltaX, -deltaY) * (180 / Math.PI);
  if (direction < 0) direction += 360;

  // Calculate intensity (0-100 based on distance from center)
  const intensity = Math.min(100, (distance / radius) * 100);

  return { direction: Math.round(direction), intensity: Math.round(intensity) };
}

function updateServer(direction, intensity) {
  fetch(`${SERVER_URL}/update`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ direction, intensity }),
  }).catch((err) => console.error("Error updating server:", err));
}

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;

  const { direction, intensity } = calculateValues(mouseX, mouseY);

  directionDisplay.textContent = direction;
  intensityDisplay.textContent = intensity;

  drawCanvas();
  updateServer(direction, intensity);
});

canvas.addEventListener("mouseleave", () => {
  mouseX = centerX;
  mouseY = centerY;
  directionDisplay.textContent = "0";
  intensityDisplay.textContent = "0";
  drawCanvas();
  updateServer(0, 0);
});

// Initial draw
drawCanvas();
