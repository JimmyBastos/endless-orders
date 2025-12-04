import { Expose } from 'class-transformer'

abstract class BaseEntity {
  @Expose()
  public id!: string

  @Expose()
  public createdAt!: Date

  @Expose()
  public updatedAt!: Date

  @Expose()
  public deletedAt?: Date | null
}

export { BaseEntity }
