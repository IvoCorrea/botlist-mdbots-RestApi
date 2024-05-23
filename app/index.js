const express = require('express')
const App = express()

App.disable('x-powered-by')
App.use('/api/oauth', require('./routes/oauth'))
App.use('/api/callback', require('./routes/oauthCallback'))

module.exports = App