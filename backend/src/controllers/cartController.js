const {sequelize,Product,Order,OrderItem,CartEvent} = require('../models');

const addToCart = async (req, res) => {
    try {
        const {userId, productId, quantity,eventType} = req.body;

        if (!userId || !productId || !quantity||!eventType) {
            return res.status(400).json({message: 'userId, productId ve quantity zorunludur'});
        }
        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({message: 'Ürün bulunamadı'});
        }
        if (product.stock < quantity) {
            return res.status(400).json({message: 'Yetersiz stok'});
        }
        await sequelize.transaction(async (t) => {
            await CartEvent.create({
                userId,
                productId,
                eventType:"add",
                quantity,
            }, {transaction: t});
            product.stock -= quantity;
            await product.save({transaction: t});
        }
        );

        return res.status(201).json({message: 'Ürün sepete eklendi'});
    }
    catch (error) {
        console.error('addToCart error:', error);
        return res.status(500).json({message: 'Sepete eklenemedi'});
    }
};

const checkout = async (req, res) => {
    console.log('CHECKOUT BODY:', req.body);

  const t = await sequelize.transaction();
  try {
    const { userId, items } = req.body;

    if (!userId || !Array.isArray(items) || items.length === 0) {
      await t.rollback();
      return res.status(400).json({ message: 'userId ve items zorunludur' });
    }

    const productIds = items.map((i) => i.productId);
    const products = await Product.findAll({
      where: { id: productIds },
      transaction: t,
    });

    if (products.length !== productIds.length) {
      await t.rollback();
      return res.status(400).json({ message: 'Bazı ürünler bulunamadı' });
    }

    let totalPrice = 0;
    const orderItemsPayload = [];

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) continue;

      const unitPrice = Number(product.price);
      const quantity = Number(item.quantity);

      const lineTotal = unitPrice * quantity;
      totalPrice += lineTotal;

      orderItemsPayload.push({
        productId: product.id,
        quantity,
        unitPrice,
      });
    }

    if (orderItemsPayload.length === 0) {
      await t.rollback();
      return res.status(400).json({ message: 'Geçerli ürün yok' });
    }

    const order = await Order.create(
      {
        userId,
        status: 'pending',
        totalPrice,
      },
      { transaction: t }
    );

    const orderItems = [];
    for (const oi of orderItemsPayload) {
      const createdItem = await OrderItem.create(
        {
          orderId: order.id,
          productId: oi.productId,
          quantity: oi.quantity,
          unitPrice: oi.unitPrice,
        },
        { transaction: t }
      );
      orderItems.push(createdItem);
    }

    await t.commit();

    return res.status(201).json({
      message: 'Sipariş oluşturuldu',
      order,
      items: orderItems,
    });
  } catch (err) {
    console.error('checkout error:', err);
    await t.rollback();
    return res.status(500).json({ message: 'Sipariş oluşturulamadı' });
  }
};


module.exports = {
    addToCart,
    checkout,
};
