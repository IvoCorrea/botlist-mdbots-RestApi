const express = require('express')
const App = express()

App.use('/api/oauth', require('./routes/oauth'))
App.use('/api/callback', require('./routes/oauthCallback'))

module.exports = App