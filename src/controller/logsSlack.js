const axios = require('axios');
require("dotenv/config")

const slackToken = process.env.SLACK_TOKEN;

async function logMessageAccess (message) {
  const url = 'https://slack.com/api/chat.postMessage';
  const res = await axios.post(url, {
    channel: '#logs-acesso',
    text: message
  }, { headers: { authorization: `Bearer ${slackToken}` } });

  console.log('Done', res.data);
}

async function logEmail (message) {
  const url = 'https://slack.com/api/chat.postMessage';
  const res = await axios.post(url, {
    channel: '#logs-de-recuperação-de-acesso',
    text: message
  }, { headers: { authorization: `Bearer ${slackToken}` } });

  console.log('Done', res.data);
}


module.exports = {
  logMessageAccess,
  logEmail
}
