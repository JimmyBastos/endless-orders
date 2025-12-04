import { OrderService } from '../OrderService'
import { AppError } from '@/errors/AppError'
import { createMockRepository } from '@/repositories/__mocks__/Repository.mock'
import { Order, OrderStatus } from '@/entities/Order'
import { createMockOrder } from '@/entities/__mocks__/Order.mock'
import { createMockOrderItem } from '@/entities/__mocks__/OrderItem.mock'
import type { OrderRepository } from '@/repositories/OrderRepository'

const mockOrderRepository = createMockRepository<Order, OrderRepository>({
  findByIdWithItems: jest.fn()
})

describe('OrderService', () => {
  let orderService: OrderService

  beforeEach(() => {
    orderService = new OrderService(mockOrderRepository)
    jest.clearAllMocks()
  })

  describe('create', () => {
    it('should create a new order successfully', async () => {
      const orderData = {
        customerId: 'customer-id',
        items: [
          { name: 'Product 1', quantity: 2, price: 1000 },
          { name: 'Product 2', quantity: 1, price: 2000 }
        ]
      }

      const expectedTotalAmount = 4000

      const mockOrder = createMockOrder({
        customerId: orderData.customerId,
        totalAmount: expectedTotalAmount,
        items: orderData.items.map((item) =>
          createMockOrderItem({
            name: item.name,
            quantity: item.quantity,
            price: item.price
          })
        )
      })

      mockOrderRepository.create.mockResolvedValue(mockOrder)

      const result = await orderService.create(orderData)

      expect(mockOrderRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          customerId: orderData.customerId,
          totalAmount: expectedTotalAmount,
          status: OrderStatus.PENDING,
          items: orderData.items
        })
      )
      expect(result.totalAmount).toBe(expectedTotalAmount)
      expect(result.items).toHaveLength(2)
    })
  })

  describe('findMany', () => {
    it('should return paginated orders without status filter', async () => {
      const mockOrders = [createMockOrder(), createMockOrder()]
      const mockResult = {
        data: mockOrders,
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      }

      mockOrderRepository.findMany.mockResolvedValue(mockResult)

      const result = await orderService.findMany()

      expect(mockOrderRepository.findMany).toHaveBeenCalledWith(undefined, undefined)
      expect(result).toEqual(mockResult)
    })

    it('should return paginated orders with status filter', async () => {
      const status = OrderStatus.PENDING

      const mockOrders = [createMockOrder({ status }), createMockOrder({ status })]
      const mockResult = {
        data: mockOrders,
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      }

      mockOrderRepository.findMany.mockResolvedValue(mockResult)

      const result = await orderService.findMany(status)

      expect(mockOrderRepository.findMany).toHaveBeenCalledWith({ status }, undefined)
      expect(result).toEqual(mockResult)
    })

    it('should return paginated orders with pagination options', async () => {
      const options = { page: 2, limit: 5 }
      const mockResult = {
        data: [],
        pagination: {
          page: 2,
          limit: 5,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: true
        }
      }

      mockOrderRepository.findMany.mockResolvedValue(mockResult)

      const result = await orderService.findMany(undefined, options)

      expect(mockOrderRepository.findMany).toHaveBeenCalledWith(undefined, options)
      expect(result).toEqual(mockResult)
    })
  })

  describe('findById', () => {
    it('should return order when found', async () => {
      const mockOrder = createMockOrder()
      mockOrderRepository.findByIdWithItems.mockResolvedValue(mockOrder)

      const result = await orderService.findById('order-id')

      expect(mockOrderRepository.findByIdWithItems).toHaveBeenCalledWith('order-id')
      expect(result).toBe(mockOrder)
    })

    it('should throw AppError when order not found', async () => {
      mockOrderRepository.findByIdWithItems.mockResolvedValue(null)

      await expect(orderService.findById('non-existent-id')).rejects.toThrow(AppError)
      await expect(orderService.findById('non-existent-id')).rejects.toThrow('Order not found')
    })
  })

  describe('updateStatus', () => {
    it.each([
      [OrderStatus.PENDING, OrderStatus.PROCESSING],
      [OrderStatus.PROCESSING, OrderStatus.COMPLETED]
    ])('should allow transition from %s to %s', async (from, to) => {
      const mockOrder = createMockOrder({ status: from })
      const updatedOrder = createMockOrder({ status: to })

      mockOrderRepository.findById.mockResolvedValue(mockOrder)
      mockOrderRepository.update.mockResolvedValue(updatedOrder)

      const result = await orderService.updateStatus('order-id', { status: to })

      expect(mockOrderRepository.findById).toHaveBeenCalledWith('order-id')
      expect(mockOrderRepository.update).toHaveBeenCalledWith('order-id', {
        status: to
      })
      expect(result.status).toBe(to)
    })

    it('should throw AppError when order not found', async () => {
      mockOrderRepository.findById.mockResolvedValue(null)

      await expect(
        orderService.updateStatus('non-existent-id', { status: OrderStatus.PROCESSING })
      ).rejects.toThrow(AppError)
      await expect(
        orderService.updateStatus('non-existent-id', { status: OrderStatus.PROCESSING })
      ).rejects.toThrow('Order not found')
    })

    it.each([[OrderStatus.COMPLETED, OrderStatus.PENDING]])(
      'should throw ValidationError for invalid transition from %s to %s',
      async (from, to) => {
        const mockOrder = createMockOrder({ status: from })
        mockOrderRepository.findById.mockResolvedValue(mockOrder)

        await expect(orderService.updateStatus('order-id', { status: to })).rejects.toThrow(
          'Invalid data'
        )

        expect(mockOrderRepository.update).not.toHaveBeenCalled()
      }
    )
  })

  describe('cancel', () => {
    it.each([OrderStatus.PENDING, OrderStatus.PROCESSING])(
      'should allow cancelling order with status %s',
      async (status) => {
        const mockOrder = createMockOrder({ status })
        const cancelledOrder = createMockOrder({ status: OrderStatus.CANCELLED })

        mockOrderRepository.findById.mockResolvedValue(mockOrder)
        mockOrderRepository.update.mockResolvedValue(cancelledOrder)

        const result = await orderService.cancel('order-id')

        expect(mockOrderRepository.findById).toHaveBeenCalledWith('order-id')
        expect(mockOrderRepository.update).toHaveBeenCalledWith('order-id', {
          status: OrderStatus.CANCELLED
        })
        expect(result.status).toBe(OrderStatus.CANCELLED)
      }
    )

    it('should throw AppError when order not found', async () => {
      mockOrderRepository.findById.mockResolvedValue(null)

      await expect(orderService.cancel('non-existent-id')).rejects.toThrow(AppError)
      await expect(orderService.cancel('non-existent-id')).rejects.toThrow('Order not found')
    })

    it('should throw ValidationError when cancelling completed order', async () => {
      const mockOrder = createMockOrder({ status: OrderStatus.COMPLETED })
      mockOrderRepository.findById.mockResolvedValue(mockOrder)

      await expect(orderService.cancel('order-id')).rejects.toThrow('Invalid data')
      expect(mockOrderRepository.update).not.toHaveBeenCalled()
    })
  })
})
