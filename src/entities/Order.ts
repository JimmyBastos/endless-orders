import { Expose, Type } from 'class-transformer'
import { OrderItem } from './OrderItem'
import { ValidationError } from '@/errors/ValidationError'
import { BaseEntity } from './BaseEntiy'

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  [OrderStatus.PROCESSING]: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
  [OrderStatus.COMPLETED]: [],
  [OrderStatus.CANCELLED]: []
}

class Order extends BaseEntity {
  @Expose()
  public customerId!: string

  @Expose()
  public totalAmount!: number

  @Expose()
  @Type(() => OrderItem)
  public items?: OrderItem[]

  private _status!: OrderStatus

  @Expose()
  get status(): OrderStatus {
    return this._status
  }

  set status(newStatus: OrderStatus) {
    this.changeStatus(newStatus)
  }

  changeStatus(newStatus: OrderStatus) {
    if (!this.canTransitionTo(newStatus)) {
      throw new ValidationError({
        fieldErrors: {
          status: [`Cannot transition from ${this._status} to ${newStatus}`]
        }
      })
    }

    this._status = newStatus
  }

  private canTransitionTo(newStatus: OrderStatus): boolean {
    if (this._status === undefined || this._status === newStatus) {
      return true
    }

    return ALLOWED_TRANSITIONS[this._status].includes(newStatus)
  }
}

export { Order }
