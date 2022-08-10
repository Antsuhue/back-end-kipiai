const modelViews = require("../model/views")
const modelUsers = require("../model/user")
const modelCards = require("../model/card")

async function insertViews(req, res){
    const { viewId, clientName, goalView, docId } = req.body

    const objView = {
        viewId,
        clientName,
        goalView,
        docId
    }

    const newView = new modelViews (objView)

    await modelUsers.updateMany({ $push:{ views:objView } })

    await newView.save()

    return res.status(200).json({"status": "View criada!"})
}

async function getViews(req, res){
    const views = await modelViews.find()

    return res
    .status(200)
    .json({ result:views })

}

async function updateViewList(req, res){
    const { list } = req.body
    const { id } = req.params

    const cards = await modelCards.find()
    let responseList = []

    cards.forEach(async (e) => {
        console.log(cards)
        if (list.includes(e.viewId.toString())){
            responseList.push({
                viewId:e.viewId,
                clientName: e.clientName,
                goalView: e.goalView
            })
        }
    });

    await modelUsers.findByIdAndUpdate(id, {views:responseList})

    return res.status(200).json({"status":"Atualizado"})

}

async function deleteView(req, res){
    const { id } = req.params

    console.log(id)

    try{
    const existView = await modelViews.findById(id)

    if (!existView){
        res.status(404).json({"status": "view informada não exite!"})
    }

    const card = await modelCards.findOne({"viewId":existView.viewId})

    await modelViews.findByIdAndDelete(id)
    await modelCards.findOneAndDelete({viewId: card.viewId})

    res.status(200).json({
        "success": true,
        "msg": "view e card excluidos",
        "status": 200
    })

}catch(err){
    res.status(500).json({
        "success": false,
        "msg": "ocorreu um erro ao executar a exclusão, tente novamnete mais tarde",
        "status": 500
})
}

}

module.exports = {
    getViews,
    insertViews,
    updateViewList,
    deleteView
}