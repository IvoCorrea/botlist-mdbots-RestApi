const Request = require('supertest')
const App = require('../../index')
const { isJWT } = require('validator')

describe('test route /auth', () => {

    it('Route /auth/login should redirect', async () => {
        const Res = await Request(App).get('/auth/login')

        expect(Res.redirect).toBe(true)
        expect(Res.statusCode).toEqual(302)
    })

    it('Route /auth/callback should set a cookie', async () => {
        const Res = await Request(App).get('/auth/callback')

        expect(Res.header).toHaveProperty('set-cookie')
    })
})