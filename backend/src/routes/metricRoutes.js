const express = require('express');
const router = express.Router();

const {getShopmetrics} = require('../controllers/metricsController');

router.get('/shopmetrics', getShopmetrics);

module.exports = router;