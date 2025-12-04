import type { BaseRepository } from '../BaseRepository'

type MergedRepo<T, K extends BaseRepository<T>> = BaseRepository<T> &
  Omit<K, keyof BaseRepository<T>>

export const createMockRepository = <T, K extends BaseRepository<T>>(
  replacements: Partial<jest.Mocked<MergedRepo<T, K>>>
): jest.Mocked<MergedRepo<T, K>> => {
  const baseMock: jest.Mocked<BaseRepository<T>> = {
    findById: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    hardDelete: jest.fn(),
    restore: jest.fn(),
    $transaction: jest.fn()
  }

  return {
    ...baseMock,
    ...replacements
  } as jest.Mocked<MergedRepo<T, K>>
}
