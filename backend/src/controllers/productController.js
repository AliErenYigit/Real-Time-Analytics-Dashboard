const { Product } = require("../models");

const createProduct = async (req, res) => {
  try {
    const { name, price, stock } = req.body;

    if (!name || price == null || stock == null) {
      return res
        .status(400)
        .json({ message: "Name, price ve stock zorunludur" });
    }
    const product = await Product.create({
      name,
      price,
      stock,
    });
    return res.status(201).json(product);
  } catch (err) {
    console.error("createProduct error:", err);
    return res.status(500).json({ message: "Ürün oluşturulamadı" });
  }
};

const listProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      order: [["createdAt", "DESC"]],
    });
    return res.json(products);
  } catch (err) {
    console.error("listProducts error:", err);

    return res.status(500).json({ message: "Ürünler getirilemedi" });
  }
};

module.exports = {
  createProduct,
  listProducts,
};