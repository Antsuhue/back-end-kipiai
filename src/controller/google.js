const { google } = require('googleapis')
const scopes = 'https://www.googleapis.com/auth/analytics.readonly'
const key = require("../config/auth.json")
const jwt = new google.auth.JWT(key.client_email, null, key.private_key, scopes)
require("dotenv");
const moment = require("moment")

// const view_id =  "156007659" //'247206534'
let obj = {}
let listMetrics = []

let DayMonth = moment().format("DD");
console.log("Dia Do mês =>", DayMonth)

function idenfyEcommerce(goal){
  if (goal == 0){
    listMetrics = ["emplooyer","ga:adCost", "ga:transactions", "ga:transactionRevenue"]    
  }else{
    let goalList = `ga:goal1completions` 
    listMetrics = ["emplooyer","ga:adCost", "ga:transactions", goalList]
  }

  return listMetrics
}

async function getData(metrica, viewId) {
console.log("Teste => "+viewId)

  try{
  const response = await jwt.authorize()

  objGoogle = {
    'auth': jwt,
    'ids': 'ga:' +viewId,
    'start-date': DayMonth+'daysAgo',
    'end-date': 'yesterday',
    'metrics': metrica, 
    'filters':"ga:source==google;ga:medium==cpc"
  }

  switch (metrica){
    case "emplooyer":
      objGoogle["metrics"] = "ga:adCost"
      const result = await google.analytics('v3').data.ga.get(objGoogle)
      return result.data.profileInfo.profileName
  }
  const result = await google.analytics('v3').data.ga.get(objGoogle)
  console.log(result.data.totalsForAllResults)

  return Object.values(result.data.totalsForAllResults)[0];


  // let resGoogle = result.data.rows[0][0]

  return console.log("fim");

}catch(error){
  console.log(error);
    }
}

async function googleData(viewId, goal){

  let transactions

  listMetrics = idenfyEcommerce(goal)

  const promises = await listMetrics.map(async element => {
      const data = await getData(element, viewId)
      obj[element] = data
  })

  await Promise.all(promises)

  const adCost = parseFloat(obj["ga:adCost"]).toFixed(2)
  if (goal == 0){
    transactions = parseFloat(obj["ga:transactions"]).toFixed(2)
  }else{
    transactions = parseFloat(obj["ga:goal1completions"]).toFixed(2)
  }
  let result = adCost / transactions
  obj["ga:orderCost"] = result.toString()

  console.log(obj)

  return obj
  
}

module.exports = { googleData }