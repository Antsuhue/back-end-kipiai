const { google } = require('googleapis')
const scopes = 'https://www.googleapis.com/auth/analytics.readonly'
const key = require("../config/auth.json")
const jwt = new google.auth.JWT(key.client_email, null, key.private_key, scopes)
require("dotenv");

const view_id = '247206534'

async function getData() {
  try{
  const response = await jwt.authorize()
  const result = await google.analytics('v3').data.ga.get({
    'auth': jwt,
    'ids': 'ga:' + view_id,
    'start-date': '5daysAgo',
    'end-date': 'today',
    'metrics': 'ga:users'
  })

  console.dir(result)
}catch(error){
  console.log(error);
}
}

getData()