const axios = require('axios');
require("dotenv/config")

const slackToken = process.env.SLACK_TOKEN;

async function sendMessage(message) {
  const url = 'https://slack.com/api/chat.postMessage';
  const res = await axios.post(url, {
    channel: '#logs-kipiai',
    text: message
  }, { headers: { authorization: `Bearer ${slackToken}` } });

  console.log('Done', res.data);
}

module.exports = {sendMessage}
