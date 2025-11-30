const express = require('express');
const {registerUser, listUsers} = require('../controllers/userController');

const router = express.Router();

router.post("/register", registerUser);

router.get("/",listUsers);

module.exports = router;