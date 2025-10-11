// src/services/ruleService.js
const RuleModel = require('../models/ruleModel');

function getCurrentDay() {
  return new Date().toLocaleDateString('en-US', { weekday: 'short' }); // e.g. "Mon"
}

function isRuleActive(rule, now = new Date()) {
  const daysActive = rule.days.split(',').map(d => d.trim());
  const currentDay = getCurrentDay();
  if (!daysActive.includes('Everyday') && !daysActive.includes(currentDay)) return false;

  const [startHour, startMin] = rule.start_time.split(':').map(Number);
  const [endHour, endMin] = rule.end_time.split(':').map(Number);
  const start = startHour * 60 + startMin;
  const end = endHour * 60 + endMin;
  const nowMins = now.getHours() * 60 + now.getMinutes();

  if (start <= end) {
    return nowMins >= start && nowMins <= end;
  } else {
    // Overnight rule (e.g., 22:00-06:00)
    return nowMins >= start || nowMins <= end;
  }
}

async function getActiveRuleForDomain(domain) {
  const rules = await RuleModel.getAll();
  const now = new Date();
  return rules.find(
    rule =>
      domain.includes(rule.domain) &&
      isRuleActive(rule, now)
  );
}

module.exports = {
  getActiveRuleForDomain,
  isRuleActive,
};
