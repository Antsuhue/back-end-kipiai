const axios = require('axios');
require("dotenv/config")

const slackToken = process.env.SLACK_TOKEN;

async function sendMessageToSlack(room, message){
  const url = 'https://slack.com/api/chat.postMessage';
  const res = await axios.post(url, {
    channel: `#${room}`,
    text: message
  }, { headers: { authorization: `Bearer ${slackToken}` } });

  console.log('Done', res.data);
}

async function logMessageAccess (message) {
  sendMessageToSlack("logs-acesso", message)
}

async function logEmail (message) {
  sendMessageToSlack("logs-de-recuperação-de-acesso", message)
}

async function logsApproved (message){
  sendMessageToSlack("logs-de-aprovação", message)
}

async function logsDisapproved (message){
  sendMessageToSlack("logs-de-desaprovação", message)
}

async function logsCreateUser (message){
  sendMessageToSlack("logs-de-criação-de-usuarios", message)
}

module.exports = {
  logMessageAccess,
  logEmail,
  logsApproved,
  logsDisapproved,
  logsCreateUser
}
