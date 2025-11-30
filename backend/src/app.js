require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { sequelize } = require('./models');


const metricRoutes = require('./routes/metricRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

// REST endpoints
app.use('/api/metrics', metricRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);

const PORT = process.env.PORT || 4000;
// SOCKET.IO
async function start() {
  try {
    await sequelize.authenticate();
    console.log('DB connected');

    // Geliştirme aşamasında sync:
    await sequelize.sync({ alter: true }); // ilk etapta { force: true } ile de kullanabilirsin

    server.listen(PORT, () => {
      console.log(`Backend listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Unable to start server:', err);
  }
}

start();