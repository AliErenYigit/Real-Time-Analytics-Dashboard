// src/controllers/userController.js
const { User } = require('../models');

const registerUser = async (req, res) => {
  try {
    const { name, email,password, role } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name ve email zorunludur' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'Bu email ile zaten kullanıcı var' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'customer',
    });

    return res.status(201).json(user);
  } catch (err) {
    console.error('registerUser error:', err);
    return res.status(500).json({ message: 'Kullanıcı oluşturulamadı' });
  }
};

const listUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      order: [['createdAt', 'DESC']],
    });
    return res.json(users);
  } catch (err) {
    console.error('listUsers error:', err);
    return res.status(500).json({ message: 'Kullanıcılar getirilemedi' });
  }
};

module.exports = {
  registerUser,
  listUsers,
};