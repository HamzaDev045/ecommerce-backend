import express from 'express'
import users from '../modules/users/router.js'
import roles from '../modules/users/roles-permissions/router.js'

export default (app) => {
    const apiV1Router = express.Router()
    apiV1Router.use('/users', users)
    apiV1Router.use('/users', roles)
    app.use('/api/v1', apiV1Router)
}
