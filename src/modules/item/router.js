import { Router } from 'express'
import controller from './controller.js'
import { isAuthorized, isAdmin } from '../../middleware/index.js'

const router = Router()

router  // Admin routes
  .post('/create-new-item', isAuthorized, isAdmin, controller.createItemController)
  .get('/get-items-admin', isAuthorized, isAdmin, controller.getItemController)
  .get('/admin/products', isAuthorized, isAdmin, controller.getAdminProducts)
  .get('/admin/low-stock', isAuthorized, isAdmin, controller.getLowStockProducts)
  .get('/admin/reviews', isAuthorized, isAdmin, controller.getProductReviews)
  .get('/admin/dashboard', isAuthorized, isAdmin, controller.getDashboardStats)
  .get('/admin/sales-graph', isAuthorized, isAdmin, controller.getSalesGraph)
  .get('/orders', isAuthorized, isAdmin, controller.getAllOrders)
  .put('/orders/:orderId/status', isAuthorized, isAdmin, controller.updateOrderStatus)

  // User routes
  .post('/place-order', isAuthorized, controller.placeOrder)
  .post('/comment', isAuthorized, controller.addCommentAndRating)
  .get('/comments/:itemId', isAuthorized, controller.getItemComments)

export default router
