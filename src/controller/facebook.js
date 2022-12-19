'use strict';
const moment = require("moment")
const bizSdk = require('facebook-nodejs-business-sdk');
const AdSet = bizSdk.AdSet;
const AdsInsights = bizSdk.AdsInsights;
const env = process.env
const app_secret = '217124367d64c5091dd71ba2e377b9d5'; //Senha da aplicação, ultilizada na estenção facebook-nodejs-business-sdk
const app_id = '878884062162011'; // Id da aplicação, ultilizada na estenção facebook-nodejs-business-sdk
const access_token = "EAAMfVyRS7FsBAHCIAUlxmNqt6yn51qAo2PDQplYGlyj2WYrQHv4uqKGGC9HkCKyb8DI8apDLAIooHvxlfcXDMLPKS8jho1fCKVm1TvSllZAuY32bWV3MpOZBuWTbimxWNLBTbst0gEe1ulZBZAy6NlxWSmEKPVbZA5pxykho2XARFe5EH4m42eFfZCZBBS6XZBkZD" //'EAAMfVyRS7FsBADFmQkr9sjZBiKsJVJBrnpKG7ml8gG8ZABZCopUgEOZB4ZC1Di9ZBTfbMbm6bqq1QMMaY3PXMAAA1m26LqdVy6COSnrOnh8cEafJjwgYFHZANBciYsH3TXApS9dmMg8ImZB97cqaKVxwdKAlrYamWcs3APhHMoHZCteCWfbzflyzuPDJf8lr90MAZD';

const showDebugingInfo = false; // Definir isso como true mostra mais informações de depuração/expurgação.

const { google } = require('googleapis')
const scopes = 'https://www.googleapis.com/auth/analytics.readonly'
const key = require("../config/auth.json")
const jwt = new google.auth.JWT(key.client_email, null, key.private_key, scopes)
require("dotenv");

let obj = {}
let listMetrics = []

let DayMonth = moment().format("DD")-1;

async function getFacebookData(idFb){

//w/Id Do Cliente, valor imutar
//'act_1018569841540901';
const api = await bizSdk.FacebookAdsApi.init(access_token);
// if (showDebugingInfo) {
//   await api.setDebug(true);
// }
// const logApiCallResult = async (apiCallName, data) => {
//   console.log("teste",apiCallName);
//   if (showDebugingInfo) {
//     console.log('Data:'+'TEST' + JSON.stringify(data));
//   }
// };

let fields, params, starting_day, yesterday;
//date start
starting_day = moment().format('YYYY-MM')
// stop date
yesterday = moment().format('YYYY-MM-DD')
// Filtros
fields = [
  'spend',
];
// Parametros
params = {
  'time_range':{'since':starting_day+'-01','until':yesterday}
};
// trazer dados do Facebook 
const insightss = (new AdSet(idFb)).getInsights(
  fields,
  params
);
return insightss

//chamada de API de insights concluída
}


function idenfyEcommerce(goal){
  if (goal == 0){
    listMetrics = ["emplooyer","ga:adCost", "ga:transactions", "ga:transactionRevenue"]    
  }
  else
  { 
    listMetrics = ["emplooyer","ga:adCost", "ga:transactions", `ga:goal${goal}completions`]
  }

  return listMetrics
}

async function getData(metrica, viewId) {
  
  console.log("Teste => "+viewId)

  try{
  let objFacebook = {
    'auth': jwt,
    'ids': 'ga:' +viewId,
    'start-date': DayMonth+'daysAgo',
    'end-date': 'yesterday',
    'metrics': metrica,
    'filters':"ga:sourceMedium=~(facebook / cp(c|m))"

   //'filters':"ga:source==google;ga:medium==cpc"
  }

  switch (metrica){
    case "emplooyer":
      objFacebook["metrics"] = "ga:adCost"
      const result = await google.analytics('v3').data.ga.get(objFacebook)
      return result.data.profileInfo.profileName
  }
  const result = await google.analytics('v3').data.ga.get(objFacebook)
  console.log(result.data.totalsForAllResults)

  return Object.values(result.data.totalsForAllResults)[0];

}catch(error){
  console.log(error);
    }
}

async function facebookData(viewId, goal){

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
  }
  
  else{
    transactions = parseFloat(obj[`ga:goal${goal}completions`]).toFixed(2)
  }

  let result = adCost / transactions
  obj["ga:orderCost"] = result.toString()

  console.log(obj)

  return obj
  
}



module.exports = { 
  getFacebookData,
  facebookData
}