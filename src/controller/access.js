const { sendMessage } = require("../controller/logsSlack")

async function login (req, res) {

    const body = req.body

    await sendMessage(`acess with login ${body.user}`)

    return res.status(200).json({status:"ok"})


}

module.exports = {
    login
}