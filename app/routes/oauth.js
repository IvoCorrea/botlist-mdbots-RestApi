require('dotenv').config()
const { CLIENT_ID, REDIRECT } = process.env
const Router = require('express').Router()

Router.get('/', (req, res) => {

    const redirect_url = `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT}&scope=identify`

    res.redirect(redirect_url)

})

module.exports = Router 