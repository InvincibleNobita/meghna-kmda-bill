const axios = require('axios');

const ADGUARD_URL = process.env.ADGUARD_URL;
const ADGUARD_USER = process.env.ADGUARD_USER;
const ADGUARD_PASS = process.env.ADGUARD_PASS;

const api = axios.create({
  baseURL: `${ADGUARD_URL}/control`,
  auth: {
    username: ADGUARD_USER,
    password: ADGUARD_PASS,
  },
});

async function blockDomain(domain) {
  await api.post('/filtering/add_url', {
    url: `||${domain}^`,
    name: 'user_blocklist',
  });
}

async function unblockDomain(domain) {
  await api.post('/filtering/remove_url', {
    url: `||${domain}^`,
    name: 'user_blocklist',
  });
}

module.exports = { blockDomain, unblockDomain };