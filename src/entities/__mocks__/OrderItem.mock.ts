import { OrderItem } from '../OrderItem'
import { faker } from '@faker-js/faker'
import { plainToInstance } from 'class-transformer'

export const createMockOrderItem = (overrides: Partial<OrderItem> = {}): OrderItem => {
  const defaultOrderItem = {
    id: faker.string.uuid(),
    orderId: faker.string.uuid(),
    name: faker.commerce.productName(),
    quantity: faker.number.int({ min: 1, max: 10 }),
    price: faker.number.int({ min: 100, max: 100000 }),
    createdAt: faker.date.past(),
    ...overrides
  }

  return plainToInstance(OrderItem, defaultOrderItem)
}
