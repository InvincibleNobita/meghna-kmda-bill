const axios = require('axios');
const PIHOLE_API_URL = process.env.PIHOLE_API_URL;
const PIHOLE_API_TOKEN = process.env.PIHOLE_API_TOKEN;

const updatePiHole = async (domain, action) => {
  if (!PIHOLE_API_URL || !PIHOLE_API_TOKEN) return;
  if (action === 'block') {
    await axios.get(`${PIHOLE_API_URL}?list=black&add=${domain}&auth=${PIHOLE_API_TOKEN}`);
  } else if (action === 'allow') {
    await axios.get(`${PIHOLE_API_URL}?list=black&sub=${domain}&auth=${PIHOLE_API_TOKEN}`);
  }
};

module.exports = { updatePiHole };