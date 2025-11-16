const directionDisplay = document.getElementById("direction");
const intensityDisplay = document.getElementById("intensity");
const statusDisplay = document.getElementById("status");
const indicator = document.getElementById("indicator");

// Server URL - loaded from configuration
const SERVER_URL = window.APP_CONFIG
  ? window.APP_CONFIG.SERVER_URL
  : "http://localhost:3000";

let isConnected = false;

function updateDisplay(data) {
  directionDisplay.textContent = data.direction;
  intensityDisplay.textContent = data.intensity;

  // Rotate indicator based on direction
  indicator.style.transform = `rotate(${data.direction}deg)`;

  // Change indicator appearance based on intensity
  if (data.intensity > 10) {
    indicator.classList.add("active");
    indicator.style.transform += ` scale(${1 + data.intensity / 100})`;
  } else {
    indicator.classList.remove("active");
  }
}

function connectWebSocket() {
  const wsUrl = SERVER_URL.replace("http", "ws");
  const ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log("WebSocket connected");
    isConnected = true;
    statusDisplay.textContent = "Connected";
    statusDisplay.classList.add("connected");
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      updateDisplay(data);
    } catch (err) {
      console.error("Error parsing WebSocket data:", err);
    }
  };

  ws.onclose = () => {
    console.log("WebSocket disconnected");
    isConnected = false;
    statusDisplay.textContent = "Disconnected";
    statusDisplay.classList.remove("connected");

    // Reconnect after 2 seconds
    setTimeout(connectWebSocket, 2000);
  };

  ws.onerror = (err) => {
    console.error("WebSocket error:", err);
  };
}

// Fallback: Poll server if WebSocket fails
function pollServer() {
  if (isConnected) return; // Skip if WebSocket is working

  fetch(`${SERVER_URL}/state`)
    .then((response) => response.json())
    .then((data) => {
      updateDisplay(data);
      if (!isConnected) {
        statusDisplay.textContent = "Connected (HTTP)";
        statusDisplay.classList.add("connected");
      }
    })
    .catch((err) => {
      console.error("Error polling server:", err);
      statusDisplay.textContent = "Connection Error";
      statusDisplay.classList.remove("connected");
    });
}

// Start WebSocket connection
connectWebSocket();

// Backup polling every second
setInterval(pollServer, 1000);
