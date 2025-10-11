const ruleService = require('../services/ruleService');

const getRules = async (req, res) => {
  const rules = await ruleService.getRules();
  res.json(rules);
};

const addRule = async (req, res) => {
  const rule = await ruleService.addRule(req.body);
  res.status(201).json(rule);
};

module.exports = { getRules, addRule };