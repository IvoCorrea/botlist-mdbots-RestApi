const Router = require('express').Router()

Router.get('/', (req, res) => {
    res.status(200).json({
        message: 'hello world'
    })
})

module.exports = Router