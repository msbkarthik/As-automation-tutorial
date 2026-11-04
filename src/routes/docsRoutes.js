const express = require('express');
const { swaggerHandlers } = require('../controller/docsController');

const router = express.Router();

router.use('/api-docs', swaggerHandlers);

module.exports = router;
