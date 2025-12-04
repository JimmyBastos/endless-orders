import { Expose } from 'class-transformer'
import { BaseEntity } from './BaseEntiy'
import { ValidationError } from '@/errors/ValidationError'

class OrderItem extends BaseEntity {
  @Expose()
  public orderId!: string
  private _name!: string
  private _quantity!: number
  private _price!: number

  @Expose()
  get name(): string {
    return this._name
  }

  set name(value: string) {
    if (!value || value.trim().length === 0) {
      throw new ValidationError({
        fieldErrors: {
          name: ['Name cannot be empty']
        }
      })
    }
    this._name = value
  }

  @Expose()
  get quantity(): number {
    return this._quantity
  }

  set quantity(value: number) {
    if (value <= 0) {
      throw new ValidationError({
        fieldErrors: {
          quantity: ['Quantity must be greater than 0']
        }
      })
    }
    this._quantity = value
  }

  @Expose()
  get price(): number {
    return this._price
  }

  set price(value: number) {
    if (value <= 0) {
      throw new ValidationError({
        fieldErrors: {
          price: ['Price must be greater than 0']
        }
      })
    }
    this._price = value
  }
}

export { OrderItem }
