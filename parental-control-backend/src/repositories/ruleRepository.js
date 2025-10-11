const { Rule } = require('../models');
const { Op } = require('sequelize');

const getAllRules = () => Rule.findAll();
const createRule = (data) => Rule.create(data);
const getActiveRules = (currentTime) =>
  Rule.findAll({
    where: {
      start_time: { [Op.lte]: currentTime },
      end_time: { [Op.gte]: currentTime }
    }
  });

module.exports = { getAllRules, createRule, getActiveRules };