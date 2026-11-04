const express = require('express');
const checkoutController = require('../controller/checkoutController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/checkout', authenticate, checkoutController.checkout);

module.exports = router;
