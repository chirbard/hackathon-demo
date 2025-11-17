const directionDisplay = document.getElementById("direction");
const intensityDisplay = document.getElementById("intensity");
const statusDisplay = document.getElementById("status");
const indicator = document.getElementById("indicator");
const sensorBubble = document.getElementById("sensorBubble");
const vehicle = document.getElementById("vehicle");

// Server URL - loaded from configuration
const SERVER_URL = window.APP_CONFIG
  ? window.APP_CONFIG.SERVER_URL
  : "http://localhost:3000";

let isConnected = false;

function updateDisplay(data) {
  directionDisplay.textContent = data.direction;
  intensityDisplay.textContent = data.intensity;

  // Update sensor bubble based on intensity (0-100)
  updateSensorBubble(data.intensity, data.direction);

  // Update indicator position and appearance
  updateIndicator(data.direction, data.intensity);
}

function updateSensorBubble(intensity, direction) {
  // Calculate bubble size based on intensity (smaller = closer object)
  // Max size at 0 intensity, min size at 100 intensity
  const maxSize = 350;
  const minSize = 200;
  const bubbleSize = maxSize - (intensity / 100) * (maxSize - minSize);

  sensorBubble.style.width = `${bubbleSize}px`;
  sensorBubble.style.height = `${bubbleSize}px`;

  // Change bubble appearance based on intensity levels
  sensorBubble.classList.remove("intense");
  if (intensity > 60) {
    sensorBubble.classList.add("intense");
  }

  // Add pulsing animation for high intensity
  if (intensity > 80) {
    sensorBubble.style.animation = "pulse 0.5s infinite alternate";
  } else if (intensity > 40) {
    sensorBubble.style.animation = "pulse 1s infinite alternate";
  } else {
    sensorBubble.style.animation = "none";
  }
}

function updateIndicator(direction, intensity) {
  // Calculate indicator distance based on intensity
  // Higher intensity = closer to vehicle (center), lower intensity = farther away
  const minDistance = 50; // Minimum distance from center (high intensity)
  const maxDistance = 320; // Maximum distance from center (low intensity)
  const indicatorDistance =
    minDistance + ((100 - intensity) / 100) * (maxDistance - minDistance);

  // Convert direction to radians (0° = top, clockwise)
  const angleRad = (direction - 90) * (Math.PI / 180);

  // Calculate position
  const x = indicatorDistance * Math.cos(angleRad);
  const y = indicatorDistance * Math.sin(angleRad);

  // Apply transform
  indicator.style.transform = `translate(${x}px, ${y}px)`;

  // Update indicator appearance based on intensity
  indicator.classList.remove("danger", "warning");
  if (intensity > 70) {
    indicator.classList.add("danger");
  } else if (intensity > 40) {
    indicator.classList.add("warning");
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
