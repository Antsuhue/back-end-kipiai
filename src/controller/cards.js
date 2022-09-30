const modelCards = require("../model/card")
const google = require("../controller/google")
const modelUser = require("../model/user")
const modelViews = require("../model/views")
const moment = require("moment")
const mailer = require("../module/mailer")
const { getDataDoc } = require("../controller/planilhas")
const cron = require("node-cron")

function formatPrice(value){
      const val = Number(value.toString().replace(",", "."));
      if (!val) return '0,00';
      const valueString = val.toFixed(2).replace(".", ",");
      return valueString.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

async function validateDoc(viewId, obj){
    const dados = await getDataDoc(viewId)

    const verifyDocData = {
        "investimento":((parseFloat(obj["adCost"].replace(".","").replace(",","")) - parseFloat(dados["Investimento"])) / parseFloat(dados["Investimento"])).toFixed(2),
        "roi":((parseFloat(obj["costPerConversion"].replace(".","").replace(",","")) - parseFloat(dados["ROI"]) ) / parseFloat(dados["ROI"])).toFixed(2),
        "receita":((parseFloat(obj["revenue"].replace(".","").replace(",","")) - parseFloat(dados["Receita"]) ) / parseFloat(dados["Receita"])).toFixed(2)
    }

    console.log("response", verifyDocData)

    return verifyDocData
}

async function createCard(clientName,viewId, goal, docId) {

    const response = await google.googleData(viewId, goal) 
    let cardObj = {} 
    console.log(response)
    if(goal == 0){
        cardObj = {
            clientName: clientName,
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
            adCost: formatPrice(response["ga:adCost"]),
            revenue: formatPrice(response[`ga:goal${goal}completions`]),
            costPerOrder: formatPrice(response["ga:orderCost"]),
            costPerConversion: formatPrice(response["ga:adCost"] /response[`ga:goal${goal}completions`]),
            lastConsult: moment().format(),
            docId: docId,
            goalView: goal
        }
    }

    const resValidation = await validateDoc(viewId, cardObj)

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

}

async function updateCard(viewId, goal){

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
            revenue: formatPrice(response[`ga:goal${goal}completions`]),
            costPerOrder: formatPrice(response["ga:orderCost"]),
            costPerConversion: formatPrice(response["ga:adCost"] / response[`ga:goal${goal}completions`]),
            lastConsult: moment().format(),
            goalView: goal
        }
    }

    const resValidation = await validateDoc(viewId, update)

    update["roi"] = resValidation.roi
    update["investment"] = resValidation.investimento
    update["recipe"] = resValidation.receita

    console.log(update)
    
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
        await updateCard(c.viewId, c.goalView)
        }
    }else{
        
        await createCard(c.clientName,c.viewId, c.goalView)

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

cron.schedule("0 12 * * *", async () =>
{
    //await sendCards()
    console.log("E-mail enviado!")
    }
)

module.exports = {
    consultCard,
    changeName,
    sendCards
}