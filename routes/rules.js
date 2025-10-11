const express = require('express');
const router = express.Router();
const Rule = require('../models/Rule');
const auth = require('../middleware/auth');

// Get all rules
router.get('/', auth, async (req, res) => {
  try {
    const rules = await Rule.find().sort({ createdAt: -1 });
    res.json(rules);
  } catch (error) {
    console.error('Error fetching rules:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new rule
router.post('/', auth, async (req, res) => {
  try {
    const newRule = new Rule(req.body);
    await newRule.save();
    res.status(201).json(newRule);
  } catch (error) {
    console.error('Error creating rule:', error);
    res.status(400).json({ message: error.message });
  }
});

// Get a specific rule
router.get('/:id', auth, async (req, res) => {
  try {
    const rule = await Rule.findById(req.params.id);
    if (!rule) return res.status(404).json({ message: 'Rule not found' });
    res.json(rule);
  } catch (error) {
    console.error('Error fetching rule:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a rule
router.put('/:id', auth, async (req, res) => {
  try {
    req.body.updatedAt = Date.now();
    const rule = await Rule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!rule) return res.status(404).json({ message: 'Rule not found' });
    res.json(rule);
  } catch (error) {
    console.error('Error updating rule:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete a rule
router.delete('/:id', auth, async (req, res) => {
  try {
    const rule = await Rule.findByIdAndDelete(req.params.id);
    if (!rule) return res.status(404).json({ message: 'Rule not found' });
    res.json({ message: 'Rule deleted successfully' });
  } catch (error) {
    console.error('Error deleting rule:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;