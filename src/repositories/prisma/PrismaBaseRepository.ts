import {
  type BaseRepository,
  type QueryContext,
  type PaginatedResult,
  type PaginationOptions,
  type DBTransaction,
  type TransactionOptions
} from '@/repositories/BaseRepository'
import type { PrismaClient } from '@prisma/client/extension'
import { plainToInstance } from 'class-transformer'
import { prisma } from './prisma'

export abstract class PrismaBaseRepository<T> implements BaseRepository<T> {
  protected abstract modelName: string
  protected abstract entity: new () => T

  protected mapToEntity = (data: Partial<T>): T => {
    return plainToInstance(this.entity, data)
  }

  protected mapToEntities = (data: Partial<T>[]): T[] => {
    return plainToInstance(this.entity, data)
  }

  protected getModel(client?: PrismaClient | DBTransaction) {
    client ??= prisma

    return client[this.modelName as keyof typeof prisma] as PrismaClient
  }

  protected getWhereClause(): Partial<T> {
    return { deletedAt: null } as unknown as Partial<T>
  }

  async findById(id: string, context?: QueryContext): Promise<T | null> {
    const whereClause = this.getWhereClause()

    const data = await this.getModel(context?.transaction).findUnique({
      where: {
        id,
        ...whereClause
      }
    })

    if (!data) {
      return null
    }

    return this.mapToEntity(data)
  }

  async findMany(filters?: Partial<T>, options?: PaginationOptions): Promise<PaginatedResult<T>> {
    const page = options?.page || 1
    const limit = options?.limit || 10
    const skip = (page - 1) * limit

    const orderBy = options?.orderBy
      ? { [options.orderBy.field]: options.orderBy.direction }
      : { createdAt: 'desc' }

    const whereClause = this.getWhereClause()

    const [data, total] = await Promise.all([
      this.getModel().findMany({
        where: { ...whereClause, ...filters },
        skip,
        take: limit,
        orderBy
      }),

      this.getModel().count({ where: whereClause })
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

  async create(data: Partial<T>, context?: QueryContext): Promise<T> {
    const createdData = await this.getModel(context?.transaction).create({
      data
    })

    return this.mapToEntity(createdData)
  }

  async update(id: string, data: Partial<T>, context?: QueryContext): Promise<T> {
    const updatedData = await this.getModel(context?.transaction).update({
      where: { id },
      data
    })

    return this.mapToEntity(updatedData)
  }

  async delete(id: string, hardDelete: boolean = false, context?: QueryContext): Promise<T> {
    if (hardDelete) {
      return this.hardDelete(id)
    }

    const deletedData = await this.getModel(context?.transaction).update({
      where: { id },
      data: { deletedAt: new Date() }
    })

    return this.mapToEntity(deletedData)
  }

  async hardDelete(id: string, context?: QueryContext): Promise<T> {
    const deletedData = await this.getModel(context?.transaction).delete({
      where: { id }
    })

    return this.mapToEntity(deletedData)
  }

  async restore(id: string, context?: QueryContext): Promise<T> {
    const restoredData = await this.getModel(context?.transaction).update({
      where: { id },
      data: { deletedAt: null }
    })

    return this.mapToEntity(restoredData)
  }

  $transaction<R>(
    callback: (context: QueryContext) => Promise<R>,
    options?: TransactionOptions
  ): Promise<R> {
    return prisma.$transaction((tx) => callback({ transaction: tx }), options)
  }
}
