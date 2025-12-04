import { Order, OrderStatus } from '@/entities/Order'
import { type OrderRepository } from '@/repositories/OrderRepository'
import {
  type QueryContext,
  type PaginationOptions,
  type PaginatedResult
} from '@/repositories/BaseRepository'
import { injectable } from 'tsyringe'
import { PrismaBaseRepository } from './PrismaBaseRepository'

@injectable()
export class PrismaOrderRepository extends PrismaBaseRepository<Order> implements OrderRepository {
  protected modelName = 'order'
  protected entity = Order

  protected getWhereClause(): Partial<Order> {
    return {} as Partial<Order>
  }

  async findByIdWithItems(id: string): Promise<Order | null> {
    const data = await this.getModel().findUnique({
      where: { id },
      include: {
        items: true
      }
    })

    if (!data) {
      return null
    }

    return this.mapToEntity(data)
  }

  async findMany(
    filters?: Partial<Order>,
    options?: PaginationOptions,
    context?: QueryContext
  ): Promise<PaginatedResult<Order>> {
    const page = options?.page || 1
    const limit = options?.limit || 10
    const skip = (page - 1) * limit

    const orderBy = options?.orderBy
      ? { [options.orderBy.field]: options.orderBy.direction }
      : { createdAt: 'desc' }

    const where = filters || {}

    const [data, total] = await Promise.all([
      this.getModel(context?.transaction).findMany({
        where,
        skip,
        take: limit,
        orderBy
      }),
      this.getModel(context?.transaction).count({ where })
    ])

    const totalPages = Math.ceil(total / limit)

    return {
      data: this.mapToEntities(data),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }
  }

  async create(orderData: Partial<Order>): Promise<Order> {
    return this.$transaction(async (context: QueryContext) => {
      const order = await this.getModel(context.transaction).create({
        data: {
          customerId: orderData.customerId!,
          totalAmount: orderData.totalAmount!,
          status: orderData.status || OrderStatus.PENDING,
          items: {
            create: orderData.items?.map(
              (item: { name: string; quantity: number; price: number }) => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price
              })
            )
          }
        },
        include: {
          items: true
        }
      })

      return this.mapToEntity(order)
    })
  }
}
