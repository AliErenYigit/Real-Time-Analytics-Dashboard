const {User, Order, OrderItem, Product, CartEvent,Session} = require('../models');

const { Op } = require('sequelize');


const ONLINE_WINDOW_MINUTES = 5;
const METRICS_WINDOW_SECONDS = 60;

const getShopmetrics = async (req, res) => {
  try {
    const now = new Date();

    const onlineThreshold = new Date(now.getTime() - ONLINE_WINDOW_MINUTES * 60 * 1000);
    const oneMinuteAgo = new Date(now.getTime() - METRICS_WINDOW_SECONDS * 1000);

    // 1) Online kullanıcı sayısı (son 5 dk içinde aktif session'ı olan unique user)
    const onlineUsersCount = await Session.count({
      distinct: true,
      col: 'userId',
      where: {
        isActive: true,
        lastActivity: { [Op.gte]: onlineThreshold },
      },
    });

    // 2) Son 1 dk sipariş sayısı
    const lastMinuteOrdersCount = await Order.count({
      where: {
        createdAt: { [Op.gte]: oneMinuteAgo },
      },
    });

    // 3) Son 1 dk sepete ekleme sayısı
    const lastMinuteCartAdds = await CartEvent.count({
      where: {
        eventType: "add",
        createdAt: { [Op.gte]: oneMinuteAgo },
      },
    });

    // 4) Aktif session sayısı
    const activeSessionsCount = await Session.count({
      where: { isActive: true },
    });

    return res.json({
      onlineUsers: onlineUsersCount,
      lastMinuteOrders: lastMinuteOrdersCount,
      lastMinuteCartAdds,
      activeSessions: activeSessionsCount,
      generatedAt: now.toISOString(),
    });
  } catch (err) {
    console.error('Error while getting shop metrics:', err);
    return res.status(500).json({ message: 'Failed to fetch shop metrics' });
  }
};

module.exports = {
    getShopmetrics,
};