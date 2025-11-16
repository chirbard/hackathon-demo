const express = require("express");
const cors = require("cors");
const WebSocket = require("ws");
const http = require("http");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(cors());
app.use(express.json());

// State storage
let currentState = {
  direction: 0,
  intensity: 0,
  timestamp: new Date().toISOString(),
};

// WebSocket connections
const clients = new Set();

wss.on("connection", (ws) => {
  clients.add(ws);
  console.log("Client connected");

  // Send current state to new client
  ws.send(JSON.stringify(currentState));

  ws.on("close", () => {
    clients.delete(ws);
    console.log("Client disconnected");
  });
});

// Broadcast to all clients
function broadcast(data) {
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// Routes
app.get("/state", (req, res) => {
  res.json(currentState);
});

app.post("/update", (req, res) => {
  const { direction, intensity } = req.body;

  currentState = {
    direction: Math.round(direction || 0),
    intensity: Math.round(intensity || 0),
    timestamp: new Date().toISOString(),
  };

  console.log("State updated:", currentState);

  // Broadcast to all WebSocket clients
  broadcast(currentState);

  res.json({ success: true, state: currentState });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
