const modelCards = require("../model/card")
const google = require("../controller/google")
const modelUser = require("../model/user")
const modelViews = require("../model/views")
const moment = require("moment")

function formatPrice(value){
      const val = Number(value.toString().replace(",", "."));
      if (!val) return '0,00';
      const valueString = val.toFixed(2).replace(".", ",");
      return valueString.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

async function createCard(clientName,viewId, goal) {

    const response = await google.googleData(viewId, goal) 

    let cardObj = {}

    if(goal == 0){
        cardObj = {
            clientName: clientName,
            viewId: viewId,
            adCost: formatPrice(response.adCost),
            revenue: formatPrice(response.transactionRevenue),
            costPerOrder: formatPrice(response.orderCost),
            costPerConversion: formatPrice(response.transactionRevenue / response.adCost),
            lastConsult: moment().format(),
            goalView: goal
        }
    }
    else{
        cardObj = {
            clientName: clientName,
            viewId: viewId,
            adCost: formatPrice(response.adCost),
            revenue: formatPrice(goalList),
            costPerOrder: formatPrice(response.orderCost),
            costPerConversion: formatPrice(response.adCost / goalList),
            lastConsult: moment().format(),
            goalView: goal
        }
    }

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
            costPerOrder: formatPrice(response.orderCost),
            costPerConversion: formatPrice(response["ga:transactionRevenue"] / response["ga:adCost"]),
            lastConsult: moment().format(),
            goal: goal
        }
    }else{
        update = {
            adCost: formatPrice(response["ga:adCost"]),
            revenue: response.goalList,
            costPerOrder: formatPrice(response.orderCost),
            costPerConversion: formatPrice(response["ga:adCost"] / response.goalList),
            lastConsult: moment().format(),
            goalView: goal
        }
    }


    await modelCards.findOneAndUpdate({viewId:viewId},update)

    return response
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

        if (diference >= 1){
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
        return res.status(500).json({"status":"Houve um erro ao relizar uma alteraçã tente novamente mais tarde!"})
    }
}


module.exports = {
    consultCard,
    changeName
}