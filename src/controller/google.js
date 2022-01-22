const google = require('googleapis')

const view_id = "247206534"


function testGoogle() {

    const clientID = process.env.CLIENT_ID
    const clientSecret = process.env.CLIENT_SECRET
    const callbackURL = 'http://localhost:4000/login/google/return'
    const oauth2Client = new google.Auth.OAuth2Client(clientID, clientSecret, callbackURL)
    const url = oauth2Client.generateAuthUrl({
        access_type: 'online',
        scope: 'https://www.googleapis.com/auth/analytics.readonly'
    })
    
    console.log(oauth2Client)
    
}

module.exports = {
    testGoogle
}