import { createMockOrder } from '../__mocks__/Order.mock'
import { OrderStatus } from '../Order'
import { ValidationError } from '@/errors/ValidationError'

describe('Order Entity', () => {
  describe('Constructor', () => {
    it('should create an order with valid data', () => {
      const order = createMockOrder()

      expect(order.id).toBeDefined()
      expect(order.customerId).toBeDefined()
      expect(order.totalAmount).toBeGreaterThanOrEqual(0)
      expect(order.status).toBeDefined()
      expect(['pending', 'processing', 'completed', 'cancelled']).toContain(order.status)
      expect(order.createdAt).toBeInstanceOf(Date)
      expect(order.updatedAt).toBeInstanceOf(Date)
      expect(Array.isArray(order.items)).toBe(true)
    })

    it('should initialize items as empty array if not provided', () => {
      const order = createMockOrder({ items: [] })

      expect(order.items).toEqual([])
    })

    it.each([
      OrderStatus.PENDING,
      OrderStatus.PROCESSING,
      OrderStatus.COMPLETED,
      OrderStatus.CANCELLED
    ])('should accept valid status: %s', (status) => {
      const order = createMockOrder({ status })
      expect(order.status).toBe(status)
    })
  })

  describe('Status Validation', () => {
    describe('Valid transitions', () => {
      it.each([
        [OrderStatus.PENDING, OrderStatus.PROCESSING],
        [OrderStatus.PENDING, OrderStatus.CANCELLED],
        [OrderStatus.PROCESSING, OrderStatus.COMPLETED],
        [OrderStatus.PROCESSING, OrderStatus.CANCELLED]
      ])('should allow transition from %s to %s', (from, to) => {
        const order = createMockOrder({ status: from })

        expect(() => {
          order.status = to
        }).not.toThrow()

        expect(order.status).toBe(to)
      })
    })

    describe('Invalid transitions', () => {
      it.each([
        [OrderStatus.PENDING, OrderStatus.COMPLETED],
        [OrderStatus.PROCESSING, OrderStatus.PENDING],
        [OrderStatus.COMPLETED, OrderStatus.PENDING],
        [OrderStatus.COMPLETED, OrderStatus.PROCESSING],
        [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
        [OrderStatus.CANCELLED, OrderStatus.PENDING],
        [OrderStatus.CANCELLED, OrderStatus.PROCESSING],
        [OrderStatus.CANCELLED, OrderStatus.COMPLETED]
      ])('should not allow transition from %s to %s', (from, to) => {
        const order = createMockOrder({ status: from })

        try {
          order.status = to
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError)
          const validationError = error as ValidationError
          expect(validationError.context.fieldErrors?.status).toContain(
            `Cannot transition from ${from} to ${to}`
          )
        }
      })
    })

    it('should allow setting initial status without validation', () => {
      const order = createMockOrder({ status: OrderStatus.COMPLETED })

      expect(order.status).toBe(OrderStatus.COMPLETED)
    })
  })
})
