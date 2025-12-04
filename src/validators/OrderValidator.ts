import { z } from 'zod/v4'

const OrderItemFields = z.object({
  name: z.string().min(1).max(255),
  quantity: z.number().int().positive(),
  price: z.number().int().positive()
})

const OrderStatusEnum = z.enum(['pending', 'processing', 'completed', 'cancelled'])

export const CreateOrderValidator = z.object({
  customerId: z.uuid(),
  items: z.array(OrderItemFields).min(1, 'Order must have at least one item')
})

export const UpdateOrderStatusValidator = z.object({
  status: OrderStatusEnum
})
