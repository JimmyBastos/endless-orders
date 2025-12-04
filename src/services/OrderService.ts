import { inject, injectable } from 'tsyringe'
import { Order } from '@/entities/Order'
import type { OrderRepository } from '@/repositories/OrderRepository'
import { OrderStatus } from '@/entities/Order'
import type { PaginationOptions, PaginatedResult } from '@/repositories/BaseRepository'
import { AppError } from '@/errors/AppError'
import { plainToInstance } from 'class-transformer'
import { OrderItem } from '@/entities/OrderItem'

type CreateOrderDto = {
  customerId: string
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
}

type UpdateOrderStatusDto = {
  status: OrderStatus
}

@injectable()
class OrderService {
  constructor(@inject('OrderRepository') private readonly orderRepository: OrderRepository) {}

  async create(orderData: CreateOrderDto): Promise<Order> {
    const totalAmount = orderData.items.reduce((sum, item) => sum + item.price * item.quantity, 0)

    return this.orderRepository.create({
      customerId: orderData.customerId,
      totalAmount,
      status: OrderStatus.PENDING,
      items: orderData.items as OrderItem[]
    })
  }

  async findMany(
    status?: OrderStatus,
    options?: PaginationOptions
  ): Promise<PaginatedResult<Order>> {
    const filters = status ? ({ status } as Partial<Order>) : undefined
    return this.orderRepository.findMany(filters, options)
  }

  async findById(id: string): Promise<Order> {
    const order = await this.orderRepository.findByIdWithItems(id)

    if (!order) {
      throw new AppError('Order not found', 404, { id })
    }

    return order
  }

  async updateStatus(id: string, statusData: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.orderRepository.findById(id)

    if (!order) {
      throw new AppError('Order not found', 404, { id })
    }

    order.changeStatus(statusData.status)

    return this.orderRepository.update(id, { status: statusData.status })
  }

  async cancel(id: string): Promise<Order> {
    return this.updateStatus(id, { status: OrderStatus.CANCELLED })
  }
}

export { OrderService }
