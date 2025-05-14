import { Router } from 'express'
import controller from './controller.js'
import { isAuthorized } from '../../../middleware/index.js'

const router = Router()

router
    .get('/roles', isAuthorized, controller.getRoles)

export default router
