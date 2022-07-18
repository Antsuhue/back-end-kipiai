const { GoogleSpreadsheet } = require('google-spreadsheet');
const credentials = require('../config/credentials.json')
const docId = "1I45bx47twROBESppOCoU70tjGjj5xqs9kcKJ60qGYvs"

const getDoc = async () => {
    const doc = new GoogleSpreadsheet(docId);

    await doc.useServiceAccountAuth(credentials, err=>{
        console.log("err")
    })
    await doc.loadInfo();
    // console.log("err", doc._rawSheets["343654180"])
    return doc;
}
getDoc().then(doc =>{
    const sheet = doc.sheetsByIndex[1]
    sheet.loadCells('A1:E8').then(result => {
        console.log(sheet.getCellByA1('C8').formattedValue)
        console.log(sheet.getCellByA1('D8').formattedValue)
        console.log(sheet.getCellByA1('E8').formattedValue)
    })

    });

