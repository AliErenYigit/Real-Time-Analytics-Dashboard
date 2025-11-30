const express = require('express');
const router = express.Router();

const {addToCart, checkout, } = require('../controllers/cartController');

router.post('/add', addToCart);
router.post('/checkoutCart', checkout);

module.exports = router;