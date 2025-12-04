import type { Request, Response } from 'express'
import type { PaginationOptions } from '@/repositories/BaseRepository'
import { injectable, inject } from 'tsyringe'
import { OrderService } from '@/services/OrderService'
import { OrderStatus } from '@/entities/Order'
import { PaginationValidator } from '@/validators/PaginationValidator'
import { serialize } from '@/utils/serialize'

@injectable()
export class OrderController {
  constructor(@inject('OrderService') private readonly service: OrderService) {}

  async create(req: Request, res: Response) {
    const { customerId, items } = req.body

    const order = await this.service.create({ customerId, items })

    res.status(201).json(serialize(order))
  }

  async findMany(req: Request, res: Response) {
    const status = req.query.status as OrderStatus | undefined
    const { data: options } = PaginationValidator.safeParse(req.query)

    const result = await this.service.findMany(status, options as PaginationOptions)

    res.status(200).json(serialize(result))
  }

  async findById(req: Request, res: Response) {
    const { id } = req.params

    if (!id) {
      return res.status(400).json({ error: 'Order ID is required' })
    }

    const order = await this.service.findById(id)

    res.status(200).json(serialize(order))
  }

  async updateStatus(req: Request, res: Response) {
    const { id } = req.params
    const { status } = req.body

    if (!id) {
      return res.status(400).json({ error: 'Order ID is required' })
    }

    const order = await this.service.updateStatus(id, { status })

    res.status(200).json(serialize(order))
  }

  async cancel(req: Request, res: Response) {
    const { id } = req.params

    if (!id) {
      return res.status(400).json({ error: 'Order ID is required' })
    }

    const order = await this.service.cancel(id)

    res.status(200).json(serialize(order))
  }
}
