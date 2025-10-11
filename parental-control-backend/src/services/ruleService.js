const ruleRepo = require('../repositories/ruleRepository');
const adguardService = require('../services/adguardService')

const getRules = () => ruleRepo.getAllRules();
const addRule = async (data) => {
  const rule = await ruleRepo.createRule(data);
  await adguardService(rule.domain, rule.action);
  return rule;
};

const applyScheduledRules = async () => {
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"
  const rules = await ruleRepo.getActiveRules(currentTime);
  for (const rule of rules) {
    await adguardService(rule.domain, rule.action);
  }
};

module.exports = { getRules, addRule, applyScheduledRules };