import { createMockOrderItem } from '../__mocks__/OrderItem.mock'
import { ValidationError } from '@/errors/ValidationError'

describe('OrderItem Entity', () => {
  describe('Constructor', () => {
    it('should create an order item with valid data', () => {
      const orderItem = createMockOrderItem()

      expect(orderItem.id).toBeDefined()
      expect(orderItem.orderId).toBeDefined()
      expect(orderItem.name).toBeDefined()
      expect(orderItem.quantity).toBeGreaterThan(0)
      expect(orderItem.price).toBeGreaterThan(0)
      expect(orderItem.createdAt).toBeInstanceOf(Date)
    })
  })

  describe('Name validation', () => {
    it('should allow setting valid name', () => {
      const orderItem = createMockOrderItem()

      expect(() => {
        orderItem.name = 'Valid Product Name'
      }).not.toThrow()

      expect(orderItem.name).toBe('Valid Product Name')
    })

    it.each([
      { value: '', description: 'empty string' },
      { value: '   ', description: 'whitespace only' }
    ])('should throw ValidationError when name is $description', ({ value }) => {
      const orderItem = createMockOrderItem()

      expect(() => {
        orderItem.name = value
      }).toThrow(ValidationError)

      try {
        orderItem.name = value
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError)
        const validationError = error as ValidationError
        expect(validationError.context.fieldErrors?.name).toContain('Name cannot be empty')
      }
    })
  })

  describe('Quantity validation', () => {
    it.each([1, 10, 100, 1000])(
      'should allow setting valid quantity: %i',
      (quantity) => {
        const orderItem = createMockOrderItem()

        expect(() => {
          orderItem.quantity = quantity
        }).not.toThrow()

        expect(orderItem.quantity).toBe(quantity)
      }
    )

    it.each([0, -1, -10])('should throw ValidationError when quantity is %i', (quantity) => {
      const orderItem = createMockOrderItem()

      expect(() => {
        orderItem.quantity = quantity
      }).toThrow(ValidationError)

      try {
        orderItem.quantity = quantity
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError)
        const validationError = error as ValidationError
        expect(validationError.context.fieldErrors?.quantity).toContain(
          'Quantity must be greater than 0'
        )
      }
    })
  })

  describe('Price validation', () => {
    it.each([1, 100, 999.99, 10000])(
      'should allow setting valid price: %i',
      (price) => {
        const orderItem = createMockOrderItem()

        expect(() => {
          orderItem.price = price
        }).not.toThrow()

        expect(orderItem.price).toBe(price)
      }
    )

    it.each([0, -1, -100])('should throw ValidationError when price is %i', (price) => {
      const orderItem = createMockOrderItem()

      expect(() => {
        orderItem.price = price
      }).toThrow(ValidationError)

      try {
        orderItem.price = price
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError)
        const validationError = error as ValidationError
        expect(validationError.context.fieldErrors?.price).toContain(
          'Price must be greater than 0'
        )
      }
    })
  })
})
