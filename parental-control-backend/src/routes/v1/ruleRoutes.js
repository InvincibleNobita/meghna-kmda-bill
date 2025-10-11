const express = require('express');
const router = express.Router();
const ruleController = require('../../controllers/ruleController');

router.get('/', ruleController.getRules);
router.post('/', ruleController.addRule);

module.exports = router;