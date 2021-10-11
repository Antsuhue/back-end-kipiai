const axios = require("axios")

async function testeGoogle(req, res) {
    
    const te = await axios.get("https://www.googleapis.com/auth/analytics.readonly")
    console.log(te);
    return res.json({"status":te.status}).status(200)
}

module.exports = {testeGoogle}
