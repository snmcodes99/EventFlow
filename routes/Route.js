const express = require('express');
const router = express.Router();

const publishFunc = require('../controller/publishController');
const consumeFunc = require('../controller/consumeController');
const healthFunc = require('../controller/healthController');
const dlqFunc = require('../controller/dlqController');
const metricsFunc = require('../controller/metricsController');

router.post('/publish', publishFunc);
router.get('/consume', consumeFunc);
router.post('/dlq', dlqFunc);
router.get('/metrics', metricsFunc);
router.get('/', healthFunc);

module.exports = router;