const express = require('express')
const Cors = require('cors')
const App = express()

const CorsOptions = {
    credentials: true,
    origin: '*'
}

App.disable('x-powered-by')
App.use(Cors(CorsOptions))
App.use('/auth', require('./routes/auth'))


module.exports = App