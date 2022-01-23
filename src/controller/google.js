const { google } = require('googleapis')
const scopes = 'https://www.googleapis.com/auth/analytics.readonly'
const key = require("../config/auth.json")
const jwt = new google.auth.JWT(key.client_email, null, key.private_key, scopes)
require("dotenv");

const view_id =  "156007659" //'247206534'
let obj = {}

let listMetrics = ["adCost", "transactions"]

async function getData(metrica) {
  try{
  const response = await jwt.authorize()
  const result = await google.analytics('v3').data.ga.get({
    'auth': jwt,
    'ids': 'ga:' + view_id,
    'start-date': '0daysAgo',
    'end-date': 'today',
    'metrics': "ga:"+metrica
  })

  return result.data.rows[0][0]

}catch(error){
  console.log(error);
    }
}

async function googleData(req,res){
  listMetrics.forEach(async element => {
    const data = await getData(element).then(result => {
      obj[element] = result
    })
  })
  return res.status(200).json(obj)
  
}

module.exports = { googleData }