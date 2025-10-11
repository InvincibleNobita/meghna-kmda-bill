const express = require('express');
const router = express.Router();

const ruleRoutesV1 = require('./v1/ruleRoutes');

router.use('/v1/rules', ruleRoutesV1);

module.exports = router;