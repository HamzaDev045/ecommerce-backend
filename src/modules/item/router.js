import { Router } from 'express'
import controller from './controller.js'
import { isAuthorized } from '../../middleware/index.js'


const router = Router()

router
.post('/create-new-item', isAuthorized,controller.createItemController)
.get('/get-items-admin', isAuthorized,controller.getItemController)



export default router
