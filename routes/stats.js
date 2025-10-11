const express = require('express');
const router = express.Router();
const DnsLog = require('../models/DnsLog');
const auth = require('../middleware/auth');

// Get recent DNS logs
router.get('/logs', auth, async (req, res) => {
  try {
    const { limit = 100, offset = 0, domain, action } = req.query;
    
    const query = {};
    if (domain) query.domain = { $regex: domain, $options: 'i' };
    if (action) query.action = action;
    
    const logs = await DnsLog.find(query)
      .sort({ timestamp: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit));
      
    const total = await DnsLog.countDocuments(query);
    
    res.json({
      logs,
      total,
      hasMore: total > parseInt(offset) + logs.length
    });
  } catch (error) {
    console.error('Error fetching DNS logs:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get statistics
router.get('/summary', auth, async (req, res) => {
  try {
    const { timeframe = '24h' } = req.query;
    
    // Calculate the start time based on the timeframe
    const now = new Date();
    let startTime;
    
    switch (timeframe) {
      case '1h':
        startTime = new Date(now - 60 * 60 * 1000);
        break;
      case '24h':
        startTime = new Date(now - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startTime = new Date(now - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startTime = new Date(now - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startTime = new Date(now - 24 * 60 * 60 * 1000);
    }
    
    // Get total requests
    const totalRequests = await DnsLog.countDocuments({
      timestamp: { $gte: startTime }
    });
    
    // Get blocked requests
    const blockedRequests = await DnsLog.countDocuments({
      timestamp: { $gte: startTime },
      action: 'blocked'
    });
    
    // Get redirected requests
    const redirectedRequests = await DnsLog.countDocuments({
      timestamp: { $gte: startTime },
      action: 'redirected'
    });
    
    // Get top domains
    const topDomains = await DnsLog.aggregate([
      { $match: { timestamp: { $gte: startTime } } },
      { $group: { _id: '$domain', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    // Get top blocked domains
    const topBlockedDomains = await DnsLog.aggregate([
      { 
        $match: { 
          timestamp: { $gte: startTime },
          action: 'blocked'
        } 
      },
      { $group: { _id: '$domain', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    res.json({
      totalRequests,
      blockedRequests,
      redirectedRequests,
      allowedRequests: totalRequests - blockedRequests - redirectedRequests,
      blockRate: totalRequests > 0 ? (blockedRequests / totalRequests) * 100 : 0,
      redirectRate: totalRequests > 0 ? (redirectedRequests / totalRequests) * 100 : 0,
      topDomains: topDomains.map(item => ({ domain: item._id, count: item.count })),
      topBlockedDomains: topBlockedDomains.map(item => ({ domain: item._id, count: item.count }))
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;