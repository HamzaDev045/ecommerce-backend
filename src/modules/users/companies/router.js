import { Router } from 'express'
import controller from './controller.js'
// import paymentMethodRoute from './paymentMethods/router'
// import { protect } from '../../utils'

const router = Router()

router
    // .get('/', controller.signin)
    .post('/', controller.createCompany)

export default router
