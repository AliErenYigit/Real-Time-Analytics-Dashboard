// backend/src/index.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 4000;

const app = express();
app.use(cors());
app.use(express.json());

// HTTP server ve Socket.IO aynı portta
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // ileride Angular domain ile kısıtlanabilir
  },
});



server.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
