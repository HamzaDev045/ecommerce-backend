import express from 'express'
import users from '../modules/users/router.js'
import item from '../modules/item/router.js'

export default (app) => {
    const apiV1Router = express.Router()
    apiV1Router.use('/users', users)
    apiV1Router.use('/item', item)
    app.use('/api/v1', apiV1Router)
}
