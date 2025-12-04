import { Order } from '../Order'
import { OrderStatus } from '../Order'
import { faker } from '@faker-js/faker'
import { plainToInstance } from 'class-transformer'
import { createMockOrderItem } from './OrderItem.mock'

export const createMockOrder = (overrides: Partial<Order> = {}): Order => {
  const items = overrides.items ?? [createMockOrderItem(), createMockOrderItem()]
  const totalAmount =
    overrides.totalAmount ?? items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const defaultOrder = {
    id: faker.string.uuid(),
    customerId: faker.string.uuid(),
    totalAmount,
    status: 'pending',
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    items,
    ...overrides
  }

  return plainToInstance(Order, defaultOrder)
}
