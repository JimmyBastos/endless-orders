import { RootController } from '@/controllers/RootController'
import { OrderController } from '@/controllers/OrderController'
import { validateWith } from '@/middlewares/validateWith'
import { CreateOrderValidator, UpdateOrderStatusValidator } from '@/validators/OrderValidator'
import { Router, type Router as ExpressRouter } from 'express'
import { container } from 'tsyringe'

const routes: ExpressRouter = Router()

/**
 * Resolve controllers with dependency injection
 */
const rootController = container.resolve(RootController)
const orderController = container.resolve(OrderController)

/**
 * System routes
 */
routes.get('/', (req, res) => rootController.index(req, res))

/**
 * Order routes
 */
routes.post('/orders', validateWith(CreateOrderValidator), (req, res) =>
  orderController.create(req, res)
)

routes.get('/orders', (req, res) => orderController.findMany(req, res))

routes.get('/orders/:id', (req, res) => orderController.findById(req, res))

routes.put('/orders/:id', validateWith(UpdateOrderStatusValidator), (req, res) =>
  orderController.updateStatus(req, res)
)

routes.delete('/orders/:id', (req, res) => orderController.cancel(req, res))

export { routes }
