require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { sequelize } = require('./models');
const { kafka, initKafka, SHOP_EVENTS_TOPIC } = require('./kafka');



const metricRoutes = require('./routes/metricRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log('🔌 client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('🔌 client disconnected:', socket.id);
  });
});
async function startShopEventsConsumer(io) {
  const consumer = kafka.consumer({ groupId: 'shop-events-consumer' });

  await consumer.connect();
  await consumer.subscribe({ topic: SHOP_EVENTS_TOPIC, fromBeginning: true });

  console.log('✅ Kafka consumer subscribed to', SHOP_EVENTS_TOPIC);

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const raw = message.value?.toString();
        if (!raw) return;

        const event = JSON.parse(raw);
        console.log('⬅️ shop-event from Kafka:', event);

        // 🔴 Tüm client’lara aynı event’i ilet
        io.emit('shop-event', event);
      } catch (err) {
        console.error('❌ Error processing shop event:', err);
      }
    },
  });
}

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

    await sequelize.sync({ alter: true });

    // 🔴 Kafka producer'ı başlat
    await initKafka();

    // 🔴 Kafka'dan shop events dinle ve Socket.IO ile broadcast et
    startShopEventsConsumer(io).catch((err) => {
      console.error('Kafka consumer error', err);
    });

    server.listen(PORT, () => {
      console.log(`Backend listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Unable to start server:', err);
  }
}

start();
