require('dotenv').config()
const { CLIENT_ID, REDIRECT, CLIENT_SECRET, JWT_SECRET } = process.env
const Router = require('express').Router()
const jwt = require('jsonwebtoken')


Router.get('/login', (req, res) => {

    const redirect_url = `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT}&scope=identify`

    res.status(302).redirect(redirect_url)

})

Router.get('/callback', async (req, res) => {

    const code = req.query['code']
    const params = new URLSearchParams({
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'grant_type': 'authorization_code',
        'redirect_uri': REDIRECT,
        'code': code
    })

    try {
        const oauthFetch = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params
        })

        const fetchedData = await oauthFetch.json()
        const generatedJwt = jwt.sign(fetchedData, JWT_SECRET, { expiresIn: 6 * 24 })

        res.cookie('jwtData', generatedJwt, {
            httpOnly: true,
            maxAge: 518400000,
        })

        res.status(200).json({
            message: 'Login feito com sucesso'
        })

    } catch (error) {
        res.status(500).send('error during auth')
    }
})
module.exports = Router 