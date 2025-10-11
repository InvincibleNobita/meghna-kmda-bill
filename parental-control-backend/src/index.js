require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const db = require('./models');
const routes = require('./routes');
const { applyScheduledRules } = require('./services/ruleService');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', routes);

// Schedule: Check every minute for rules to apply
cron.schedule('* * * * *', applyScheduledRules);

const PORT = process.env.PORT || 5000;
db.sequelize.sync().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});