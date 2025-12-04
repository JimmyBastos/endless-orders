import 'reflect-metadata'
import { prisma } from '@/repositories/prisma/prisma'
import type { PrismaClient } from '@prisma/client/extension'
import { PrismaOrderRepository } from '../PrismaOrderRepository'
import { createMockOrder } from '@/entities/__mocks__/Order.mock'
import { createMockOrderItem } from '@/entities/__mocks__/OrderItem.mock'
import { Order } from '@/entities/Order'
import { OrderItem } from '@/entities/OrderItem'
import { instanceToPlain } from 'class-transformer'

jest.mock('@/repositories/prisma/prisma', () => ({
  prisma: {
    order: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    },
    $transaction: jest.fn()
  }
}))

describe('PrismaOrderRepository', () => {
  let repository: PrismaOrderRepository
  let mockPrisma: jest.mock<PrismaClient>

  beforeEach(() => {
    repository = new PrismaOrderRepository()
    mockPrisma = prisma.order

    jest.clearAllMocks()
  })

  describe('findByIdWithItems', () => {
    it('should return an Order entity with items when found', async () => {
      const mockOrder = createMockOrder({
        id: 'order-id',
        customerId: 'customer-id',
        totalAmount: 5000,
        items: [
          createMockOrderItem({
            id: 'item-1',
            orderId: 'order-id',
            name: 'Product 1',
            quantity: 2,
            price: 1500
          }),
          createMockOrderItem({
            id: 'item-2',
            orderId: 'order-id',
            name: 'Product 2',
            quantity: 1,
            price: 2000
          })
        ]
      })

      // Prisma returns plain objects, not class instances
      const mockOrderData = instanceToPlain(mockOrder)

      mockPrisma.findUnique.mockResolvedValue(mockOrderData)

      const result = await repository.findByIdWithItems('order-id')

      expect(mockPrisma.findUnique).toHaveBeenCalledWith({
        where: { id: 'order-id' },
        include: { items: true }
      })
      expect(result).toBeInstanceOf(Order)
      expect(result?.id).toBe(mockOrder.id)
      expect(result?.items).toBeDefined()
      expect(result?.items).toHaveLength(2)
      expect(result?.items?.[0]).toBeInstanceOf(OrderItem)
    })

    it('should return null when order not found', async () => {
      mockPrisma.findUnique.mockResolvedValue(null)

      const result = await repository.findByIdWithItems('non-existent-id')
      expect(result).toBeNull()
    })
  })

  describe('findMany', () => {
    it('should return paginated orders without filters', async () => {
      const mockOrders = [
        createMockOrder({
          id: 'order-1',
          customerId: 'customer-1',
          totalAmount: 3000,
          status: 'pending'
        }),
        createMockOrder({
          id: 'order-2',
          customerId: 'customer-2',
          totalAmount: 5000,
          status: 'processing'
        })
      ]

      // Prisma returns plain objects, not class instances
      const mockOrdersData = mockOrders.map((order) => instanceToPlain(order))

      mockPrisma.findMany.mockResolvedValue(mockOrdersData)
      mockPrisma.count.mockResolvedValue(2)

      const result = await repository.findMany()

      expect(mockPrisma.findMany).toHaveBeenCalled()
      expect(result.data).toHaveLength(2)
      expect(result.data[0]).toBeInstanceOf(Order)
      expect(result.pagination.total).toBe(2)
    })

    it('should return paginated orders with status filter', async () => {
      const status = 'pending'
      const mockOrders = [
        createMockOrder({ id: 'order-1', customerId: 'customer-1', totalAmount: 3000, status })
      ]

      mockPrisma.findMany.mockResolvedValue(mockOrders)
      mockPrisma.count.mockResolvedValue(1)

      const result = await repository.findMany({ status }, { page: 1, limit: 10 })

      expect(mockPrisma.findMany).toHaveBeenCalledWith({
        where: { status },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' }
      })

      const [firstOrder] = result.data

      expect(firstOrder?.status).toBe(status)
    })
  })

  describe('create', () => {
    it('should create order with items in transaction', async () => {
      const orderData = {
        customerId: 'customer-id',
        totalAmount: 5000,
        status: 'pending' as const,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const items = [
        { name: 'Product 1', quantity: 2, price: 1500 },
        { name: 'Product 2', quantity: 1, price: 2000 }
      ]

      const mockCreatedOrder = createMockOrder({
        id: 'order-id',
        ...orderData,
        items: [
          createMockOrderItem({
            id: 'item-1',
            orderId: 'order-id',
            name: items[0]!.name,
            quantity: items[0]!.quantity,
            price: items[0]!.price
          }),
          createMockOrderItem({
            id: 'item-2',
            orderId: 'order-id',
            name: items[1]!.name,
            quantity: items[1]!.quantity,
            price: items[1]!.price
          })
        ]
      })

      mockPrisma.create.mockResolvedValue(mockCreatedOrder)

      // Mock $transaction to execute the callback
      ;(prisma.$transaction as jest.Mock).mockImplementation(
        async (callback: (tx: AnyObject) => Promise<Order>) => {
          return callback({ order: mockPrisma })
        }
      )

      const result = await repository.create(orderData)

      expect(prisma.$transaction).toHaveBeenCalled()
      expect(result).toBeInstanceOf(Order)
      expect(result.items).toHaveLength(2)
      expect(result.items?.[0]).toBeInstanceOf(OrderItem)
    })
  })
})
