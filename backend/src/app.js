require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 4000;

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

// REST endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.get('/api/metrics', (req, res) => {
  res.json({
    cpuUsage: Math.random() * 100,
    memoryUsage: Math.random() * 100,
    requestPerSecond: Math.floor(Math.random() * 200),
    timestamp: Date.now(),
  });
});

// SOCKET.IO
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  const interval = setInterval(() => {
    const data = {
      cpuUsage: Math.random() * 100,
      memoryUsage: Math.random() * 100,
      requestPerSecond: Math.floor(Math.random() * 200),
      timestamp: Date.now(),
    };
    console.log('Emitting metrics-update to', socket.id, data);
    socket.emit('metrics-update', data);
  }, 2000);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    clearInterval(interval);
  });
});

server.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
