export interface OrderBy {
  field: string
  direction: 'asc' | 'desc'
}

export interface PaginationOptions {
  page: number
  limit: number
  orderBy?: OrderBy
}

export interface PaginatedResult<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export type DBTransaction = AnyObject

export interface QueryContext {
  transaction: DBTransaction
}

export interface TransactionOptions {
  isolationLevel?: 'Serializable' | 'RepeatableRead' | 'ReadCommitted' | 'ReadUncommitted'
  timeout?: number
  maxWait?: number
}

export interface BaseRepository<T> {
  findById(id: string, context?: QueryContext): Promise<T | null>
  findMany(
    filters?: Partial<T>,
    options?: PaginationOptions,
    context?: QueryContext
  ): Promise<PaginatedResult<T>>
  create(data: Partial<T>, context?: QueryContext): Promise<T>
  update(id: string, data: Partial<T>, context?: QueryContext): Promise<T>
  delete(id: string, hardDelete?: boolean, context?: QueryContext): Promise<T>
  hardDelete(id: string, context?: QueryContext): Promise<T>
  restore(id: string, context?: QueryContext): Promise<T>
  $transaction<R>(
    callback: (context: QueryContext) => Promise<R>,
    options?: TransactionOptions
  ): Promise<R>
}
