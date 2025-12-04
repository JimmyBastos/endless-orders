import { container } from 'tsyringe'

import { OrderService } from '@/services/OrderService'

import { RootController } from '@/controllers/RootController'
import { OrderController } from '@/controllers/OrderController'

import { PrismaOrderRepository } from '@/repositories/prisma/PrismaOrderRepository'

import { type OrderRepository } from '@/repositories/OrderRepository'

/**
 * Repositories
 */
container.register<OrderRepository>('OrderRepository', PrismaOrderRepository)

/**
 * Services
 */
container.register<OrderService>('OrderService', OrderService)

/**
 * Controllers
 */
container.register(RootController, RootController)
container.register(OrderController, OrderController)
