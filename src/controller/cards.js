const modelCards = require("../model/card")
const google = require("../controller/google")
const modelUser = require("../model/user")
const modelViews = require("../model/views")
const moment = require("moment")
const mailer = require("../module/mailer")
const { getDataDoc } = require("../controller/planilhas")
const cron = require("node-cron")
const { getFacebookData, facebookData } = require("../controller/facebook")

function formatPrice(value){
    if (value == NaN || value == undefined) return '0,00';
      const val = Number(value.toString().replace(",", "."));
      if (!val) return '0,00';
      const valueString = val.toFixed(2).replace(".", ",");
      return valueString.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

async function validateDoc(viewId, obj, idFb){
    const dados = await getDataDoc(viewId)

    const verifyDocData = {
        "investimento":((parseFloat(obj["adCost"].replace(".","").replace(",","")) - parseFloat(dados["Investimento"])) / parseFloat(dados["Investimento"])).toFixed(2),
        "roi":((parseFloat(obj["costPerConversion"].replace(".","").replace(",","")) - parseFloat(dados["ROI"]) ) / parseFloat(dados["ROI"])).toFixed(2),
        "receita":((parseFloat(obj["revenue"].replace(".","").replace(",","")) - parseFloat(dados["Receita"]) ) / parseFloat(dados["Receita"])).toFixed(2)
    }

    if(idFb != 0){
        verifyDocData["fb_investimento"] = ((parseFloat(obj["fb_spend"].replace(".","").replace(",","")) - parseFloat(dados["fb_Investimento"])) / parseFloat(dados["fb_Investimento"])).toFixed(2),
        verifyDocData["fb_roi"] = ((parseFloat(obj["fb_costPerConversion"].replace(".","").replace(",","")) - parseFloat(dados["fb_ROI"]) ) / parseFloat(dados["fb_ROI"])).toFixed(2),
        verifyDocData["fb_receita"] = ((parseFloat(obj["fb_revenue"].replace(".","").replace(",","")) - parseFloat(dados["fb_Receita"]) ) / parseFloat(dados["fb_Receita"])).toFixed(2)
        }


    console.log("response", verifyDocData)

    return verifyDocData
}

async function createCard(clientName,viewId, goal, docId, idFb) {
    
    try {
        const response = await google.googleData(viewId, goal)

        let cardObj = {} 
        console.log(response)
        if(goal == 0){
            cardObj = {
                clientName: clientName,
                idFb: idFb,
                viewId: viewId,
                adCost: formatPrice(response["ga:adCost"]),
                revenue: formatPrice(response["ga:transactionRevenue"]),
                costPerOrder: formatPrice(response["ga:orderCost"]),
                costPerConversion: formatPrice(response["ga:transactionRevenue"] / response["ga:adCost"]),
                lastConsult: moment().format(),
                docId: docId,
                goalView: goal
            }
        }
        else{
            cardObj = {
                clientName: clientName,
                viewId: viewId,
                idFb: idFb,
                adCost: formatPrice(response["ga:adCost"]),
                revenue: formatPrice(response["ga:transactions"]),
                costPerOrder: formatPrice(response["ga:orderCost"]),
                costPerConversion: formatPrice(response["ga:adCost"] /response["ga:transactions"]),
                lastConsult: moment().format(),
                docId: docId,
                goalView: goal
            }
        }
        try{
        if(idFb != 0){
            const respFace = await facebookData(viewId, goal)   
            getFacebookData(idFb).then(resp => {
                cardObj["fb_spend"] = resp[0]["_data"]["spend"]
                cardObj["fb_costPerOrder"] = formatPrice(cardObj["fb_spend"]/ respFace["ga:transactions"] )
                if(goal == 0){
                    cardObj["fb_revenue"] = formatPrice(respFace["ga:transactionRevenue"])
                    cardObj["fb_costPerConversion"] = formatPrice(respFace["ga:transactionRevenue"] / cardObj["fb_spend"])
                }
                else{
                    cardObj["fb_revenue"] = formatPrice(respFace["ga:transactions"])
                    cardObj["fb_costPerConversion"] = formatPrice(cardObj["fb_spend"] / respFace["ga:transactions"])
                }
            })
            }
        }catch(err){
         throw err
    }

    const resValidation = await validateDoc(viewId, cardObj, idFb)
    if(idFb != 0){
    cardObj["fb_investment"] = resValidation.fb_investimento
    cardObj["fb_roi"] = resValidation.fb_roi
    cardObj["fb_recipe"] = resValidation.fb_receita
    }

    cardObj["roi"] = resValidation.roi
    cardObj["investment"] = resValidation.investimento
    cardObj["recipe"] = resValidation.receita

    var newCard = new modelCards(cardObj)
    
    const newPromise = new Promise((resolve, reject) => {
        setTimeout( async () =>{
            await newCard.save()
            resolve(console.log(newCard))
        }, 500)
    })
} catch (err) {
    throw err
    } 
}

async function updateCard(viewId, goal, idFb){

    let update

    const response = await google.googleData(viewId, goal) 

    console.log("Resposta ->",  response["ga:orderCost"])

    if (goal == 0){
        update = {
            adCost: formatPrice(response["ga:adCost"]),
            revenue: formatPrice(response["ga:transactionRevenue"]),
            costPerOrder: formatPrice(response["ga:orderCost"]),
            costPerConversion: formatPrice(response["ga:transactionRevenue"] / response["ga:adCost"]),
            lastConsult: moment().format(),
            goal: goal
        }
    }else{
        update = {
            adCost: formatPrice(response["ga:adCost"]),
            revenue: formatPrice(response["ga:transactions"]),
            costPerOrder: formatPrice(response["ga:orderCost"]),
            costPerConversion: formatPrice(response["ga:adCost"] / response["ga:transactions"]),//response[`ga:goal${goal}completions`]
            lastConsult: moment().format(),
            goalView: goal
        }
    }
    try{
        if(idFb != 0){
            const respFace = await facebookData(viewId, goal)
            update["idFb"] = idFb
            getFacebookData(idFb).then(resp => {
                update["fb_spend"] = resp[0]["_data"]["spend"]
                update["fb_costPerOrder"] = formatPrice(update["fb_spend"]/ respFace["ga:transactions"] )
                if(goal == 0){
                    update["fb_revenue"] = formatPrice(respFace["ga:transactionRevenue"])
                    update["fb_costPerConversion"] = formatPrice(respFace["ga:transactionRevenue"] / update["fb_spend"])
                }
                else{
                    update["fb_revenue"] = formatPrice(respFace["ga:transactions"])
                    update["fb_costPerConversion"] = formatPrice(update["fb_spend"] / respFace["ga:transactions"])
                }
            })
            }
        }catch(err){
         throw err
    }

    const resValidation = await validateDoc(viewId, update, idFb)
    if(idFb != 0){
    update["fb_investment"] = resValidation.fb_investimento
    update["fb_roi"] = resValidation.fb_roi
    update["fb_recipe"] = resValidation.fb_receita
}
    update["roi"] = resValidation.roi
    update["investment"] = resValidation.investimento
    update["recipe"] = resValidation.receita

    console.log(update)

    await modelCards.findOneAndUpdate({viewId:viewId}, update)
    
}

async function consultCard(req, res){
    const views = await modelViews.find()
    const { id } = req.body
 
    await views.forEach(async (c) => {
        
        const card = await modelCards.findOne({viewId: c.viewId.toString()})

    if (card){

        const time = moment(card.lastConsult)
        const now = moment(moment().format())

        const diference = now.diff(time, "hour")

        if (diference >= 0){
        await updateCard(c.viewId, c.goalView, c.idFb)
        }
    }else{
        
        await createCard(c.clientName,c.viewId, c.goalView, c.docId, c.idFb)

    }
    })
    
    const result = await modelCards.find()

    const user = await modelUser.findById(id)
    const cardsSelecionados = user.views

    let listaCards = []
    let listaViews = []

    cardsSelecionados.forEach((view) => {
        listaViews.push(view.viewId.toString())
    })

    await result.forEach(async (card) =>{

        if (listaViews.includes(card.viewId.toString())){
            listaCards.push(card)
        }

    })

    return res.status(200).json({listaCards})
    
}

async function changeName(req, res){
    const { name } = req.body
    const { id } = req.params
    
    const card = await modelCards.findById(id)

    if (!card){
        return res.status(404).json({"status":"Card não existente"})
    }
    try{

    if(card.clientName == name){
        return res.status(200).json({"status":"Nome não alterado"})
    }

    await modelCards.findByIdAndUpdate(id, {clientName: name})

    return res.status(200).json({"status":"Nome do card alterado"})

    }catch(err){
        console.log(err)
        return res.status(500).json({"status":"Houve um erro ao relizar uma alteração tente novamente mais tarde!"})
    }
}

async function sendCards(){
    const { userHot } = require("../config/mail.json")
    mailer.sendMail({
        to: "guilherme.goncalves.1100@gmail.com",
        from: userHot,
        template: "resource/report_Card",
        subject:"Atualização de Dados - Kipiai",
        // context: { token, userName, URL }
    }, (err,res) => {
        if (err){
            console.log(err)
        }
    })
}

async function listCards(req, res) {
    try{
    const cards = await modelCards.find();

    return res.status(200).json(cards);
  }catch(err){
    console.log(err)
    return res.status(500).json({"Status":"Ocorreu um erro durante o processamentos dos cards",
    "Err":err})
}

}
cron.schedule("0 12 * * *", async () =>
{
    //await sendCards()
    console.log("E-mail enviado!")
    }
)

cron.schedule("0 * *  * *", async () =>{
    const cards = await modelCards.find()

    cards.forEach(c => {
        updateCard(c.viewId, c.goalView, c.idFb)
    })
}
)


module.exports = {
    consultCard,
    changeName,
    sendCards,
    listCards
}