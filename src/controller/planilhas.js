const { GoogleSpreadsheet } = require('google-spreadsheet');
const credentials = require('../config/credentials.json')
const modelViews = require("../model/views")


const getDoc = async (docId) => {
    const doc = new GoogleSpreadsheet(docId);

    await doc.useServiceAccountAuth(credentials, err => {
        console.log("err")
    })
    await doc.loadInfo();
    return doc;
}

async function getDataDoc(viewId) {

    const view = await modelViews.findOne({viewId:viewId})

    let objResponse = {}

    const doc = await getDoc(view.docId)
    const sheet = doc.sheetsByTitle["Resultado esperado"]
    await sheet.loadCells('A1:J8')
    objResponse = {
        "Investimento": sheet.getCellByA1('C8').formattedValue.replace(".","").replace(",",""),
        "ROI": sheet.getCellByA1('D8').formattedValue.replace(".","").replace(",",""),
        "Receita": sheet.getCellByA1('E8').formattedValue.replace(".","").replace(",","")
    };

    if(view.idFb != 0){
        objResponse["fb_Investimento"] =sheet.getCellByA1('H8').formattedValue.replace(".","").replace(",",""),
        objResponse["fb_ROI"] =sheet.getCellByA1('I8').formattedValue.replace(".","").replace(",",""),
        objResponse["fb_Receita"] =sheet.getCellByA1('J8').formattedValue.replace(".","").replace(",","")
    }

    return objResponse
}


module.exports = {
    getDataDoc
}