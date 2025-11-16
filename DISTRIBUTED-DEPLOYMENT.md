# Distributed Deployment Guide

This guide explains how to run the hackathon demo project across two computers:

- **Server Machine**: Runs the server and admin dashboard
- **Presenter Machine**: Runs the presenter client

## Prerequisites

- Docker and Docker Compose installed on both machines
- Both machines on the same network (or network connectivity between them)
- Firewall configured to allow traffic on ports 3000-3002

## Setup Instructions

### 1. Server Machine Setup

1. **Copy the project files** to the server machine
2. **Find the server's IP address**:

   ```bash
   # On macOS/Linux:
   hostname -I
   # Or:
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```

   Note this IP address (e.g., `192.168.1.100`)

3. **Create environment file**:

   ```bash
   echo "COMPOSE_PROJECT_NAME=hackathon-demo-server" > .env
   ```

4. **Start the server and admin dashboard**:

   ```bash
   docker-compose -f docker-compose.server.yml up -d
   ```

5. **Verify services are running**:
   - Server API: http://[SERVER_IP]:3000/health
   - Admin Dashboard: http://[SERVER_IP]:3001

### 2. Presenter Machine Setup

1. **Copy the project files** to the presenter machine
2. **Create environment file** with the server's IP address:

   ```bash
   echo "SERVER_HOST=192.168.1.100" > .env
   echo "COMPOSE_PROJECT_NAME=hackathon-demo-presenter" >> .env
   ```

   _(Replace `192.168.1.100` with your actual server IP)_

3. **Start the presenter client**:

   ```bash
   docker-compose -f docker-compose.presenter.yml up -d
   ```

4. **Access the presenter client**:
   - Open browser to: http://localhost:3002

### 3. Testing the Setup

1. **Open the admin dashboard** on the server machine: http://[SERVER_IP]:3001
2. **Open the presenter client** on the presenter machine: http://localhost:3002
3. **Move the mouse** around the circle in the admin dashboard
4. **Verify** that the presenter client updates in real-time

## Port Configuration

| Service          | Port | Description                   |
| ---------------- | ---- | ----------------------------- |
| Server API       | 3000 | REST API and WebSocket server |
| Admin Dashboard  | 3001 | Control interface             |
| Presenter Client | 3002 | Display interface             |

## Troubleshooting

### Connection Issues

1. **Check firewall settings** on the server machine:

   ```bash
   # Allow ports 3000-3002
   sudo ufw allow 3000:3002/tcp
   ```

2. **Verify server is accessible** from presenter machine:

   ```bash
   curl http://[SERVER_IP]:3000/health
   ```

3. **Check Docker containers are running**:
   ```bash
   docker-compose -f docker-compose.server.yml ps
   docker-compose -f docker-compose.presenter.yml ps
   ```

### Network Connectivity

- Ensure both machines are on the same network or have routing configured
- Check that no VPN or proxy is interfering with connections
- Try pinging the server machine from the presenter machine

### Browser Console Errors

- Open browser developer tools on the presenter client
- Check for WebSocket connection errors
- Verify the SERVER_HOST environment variable is set correctly

## Stopping the Services

**On the server machine:**

```bash
docker-compose -f docker-compose.server.yml down
```

**On the presenter machine:**

```bash
docker-compose -f docker-compose.presenter.yml down
```

## Alternative: Running Without Docker

If you prefer to run without Docker, you can:

1. **Server machine**: Install Node.js and run:

   ```bash
   cd server
   npm install
   node server.js
   ```

2. **Both machines**: Serve the HTML files using any web server (e.g., Python's built-in server, nginx, etc.)

3. **Update the JavaScript files** manually to point to the correct server IP address.
