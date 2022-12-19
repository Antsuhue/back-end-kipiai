'use strict';
const bizSdk = require('facebook-nodejs-business-sdk');
const AdSet = bizSdk.AdSet;
const AdsInsights = bizSdk.AdsInsights;

const access_token = "EAAMfVyRS7FsBAHCIAUlxmNqt6yn51qAo2PDQplYGlyj2WYrQHv4uqKGGC9HkCKyb8DI8apDLAIooHvxlfcXDMLPKS8jho1fCKVm1TvSllZAuY32bWV3MpOZBuWTbimxWNLBTbst0gEe1ulZBZAy6NlxWSmEKPVbZA5pxykho2XARFe5EH4m42eFfZCZBBS6XZBkZD" //'EAAMfVyRS7FsBADFmQkr9sjZBiKsJVJBrnpKG7ml8gG8ZABZCopUgEOZB4ZC1Di9ZBTfbMbm6bqq1QMMaY3PXMAAA1m26LqdVy6COSnrOnh8cEafJjwgYFHZANBciYsH3TXApS9dmMg8ImZB97cqaKVxwdKAlrYamWcs3APhHMoHZCteCWfbzflyzuPDJf8lr90MAZD';
const app_secret = '217124367d64c5091dd71ba2e377b9d5'; //Senha da aplicação, ultilizada na estenção facebook-nodejs-business-sdk
const app_id = '878884062162011';
const id = 'act_1018569841540901';
const api = bizSdk.FacebookAdsApi.init(access_token);
const showDebugingInfo = true; // Setting this to true shows more debugging info.
if (showDebugingInfo) {
  api.setDebug(true);
}

const logApiCallResult = (apiCallName, data) => {
  console.log(apiCallName);
  if (showDebugingInfo) {
    console.log('Data:' + JSON.stringify(data));
  }
};

let fields, params;
fields = [
  'impressions',
  'spend'
];
params = {
  'breakdown' : 'publisher_platform',
};
const insightss = (new AdSet(id)).getInsights(
  fields,
  params
);
logApiCallResult('insightss api call complete.', insightss);