require('dotenv').config()
const { CLIENT_ID, REDIRECT, CLIENT_SECRET, JWT_SECRET } = process.env
const Router = require('express').Router()
const jwt = require('jsonwebtoken')

Router.get('/', async (req, res) => {

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
        const generatedJwt = jwt.sign(fetchedData, JWT_SECRET, { expiresIn: 6 * 24})
        
        res.cookie('jwtData', generatedJwt, { maxAge: 604800000 })
        res.send(`${generatedJwt}`)
        
    } catch (error) {
        res.statusCode(500).send('error during auth')
    }
})

module.exports = Router