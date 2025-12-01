// src/kafka.js
const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'shop-backend',
  brokers: [process.env.KAFKA_BROKER],
});

const producer = kafka.producer();

async function initKafka() {
  await producer.connect();
  console.log('✅ Kafka producer connected');
}

const SHOP_EVENTS_TOPIC = process.env.SHOP_EVENTS_TOPIC ;

module.exports = {
  kafka,
  producer,
  initKafka,
  SHOP_EVENTS_TOPIC,
};
