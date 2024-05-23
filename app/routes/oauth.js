require('dotenv').config()
const { CLIENT_ID, REDIRECT } = process.env
const Router = require('express').Router()

Router.get('/', (req, res) => {

    const redirect_url = `https://discord.com/oauth2/authorize?client_id=1242847739394654349&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A9098%2Fapi%2Fcallback&scope=identify`

    res.redirect(redirect_url)

})

module.exports = Router 