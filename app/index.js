const express = require('express')
const App = express()

App.use('/api/auth', require('./routes/auth'))

module.exports = App