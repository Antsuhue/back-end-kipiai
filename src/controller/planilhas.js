const { GoogleSpreadsheet } = require('google-spreadsheet');
const credentials = require('../config/credentials.json')
const modelViews = require("../model/views")
//const docId = "1I45bx47twROBESppOCoU70tjGjj5xqs9kcKJ60qGYvs"

const getDoc = async (docId) => {
    const doc = new GoogleSpreadsheet(docId);

    await doc.useServiceAccountAuth(credentials, err => {
        console.log("err")
    })
    await doc.loadInfo();
    // console.log("err", doc._rawSheets["343654180"])
    return doc;
}

async function getDataDoc(viewId) {

    const view = await modelViews.findOne({viewId:viewId})

    let objResponse = {}

    const doc = await getDoc(view.docId)
    const sheet = doc.sheetsByIndex[1]
    await sheet.loadCells('A1:E8')
    objResponse = {
        "Investimento": sheet.getCellByA1('C8').formattedValue.replaceAll(",",""),
        "ROI": sheet.getCellByA1('D8').formattedValue.replaceAll(",",""),
        "Receita": sheet.getCellByA1('E8').formattedValue.replaceAll(",","") 
    }


    return objResponse
}


module.exports = {
    getDataDoc
}