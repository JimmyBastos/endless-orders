import type { Order } from '@/entities/Order'
import type { BaseRepository } from './BaseRepository'

interface OrderRepository extends BaseRepository<Order> {
  findByIdWithItems(id: string): Promise<Order | null>
}

export { type OrderRepository }
