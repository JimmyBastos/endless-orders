import { faker } from '@faker-js/faker'
import type { PrismaClient } from '@prisma/client/extension'
import { prisma } from '@/repositories/prisma/prisma'
import { PrismaBaseRepository } from '../PrismaBaseRepository'
import { TestEntity } from '@/repositories/__mocks__/TestEntity.mock'

jest.mock('../prisma', () => ({
  prisma: {
    test: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    }
  }
}))

class TestRepository extends PrismaBaseRepository<TestEntity> {
  protected modelName = 'test'
  protected entity = TestEntity
}

describe('PrismaBaseRepository', () => {
  let repository: TestRepository
  let mockPrisma: PrismaClient

  beforeEach(() => {
    repository = new TestRepository()
    mockPrisma = prisma.test
    jest.clearAllMocks()
  })

  describe('findById', () => {
    it('should return an entity when found', async () => {
      const mockData = {
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
        deletedAt: null
      }

      mockPrisma.findUnique.mockResolvedValue(mockData)
      const result = await repository.findById(mockData.id)

      expect(mockPrisma.findUnique).toHaveBeenCalledWith({
        where: { id: mockData.id, deletedAt: null }
      })
      expect(result).toBeInstanceOf(TestEntity)
      expect(result?.id).toBe(mockData.id)
      expect(result?.name).toBe(mockData.name)
    })

    it('should return null when not found', async () => {
      mockPrisma.findUnique.mockResolvedValue(null)
      const result = await repository.findById('not-found')
      expect(result).toBeNull()
    })
  })

  describe('findMany', () => {
    it('should return paginated results', async () => {
      const mockData = [
        {
          id: faker.string.uuid(),
          name: faker.person.fullName(),
          createdAt: faker.date.past(),
          updatedAt: faker.date.recent(),
          deletedAt: null
        },
        {
          id: faker.string.uuid(),
          name: faker.person.fullName(),
          createdAt: faker.date.past(),
          updatedAt: faker.date.recent(),
          deletedAt: null
        }
      ]

      mockPrisma.findMany.mockResolvedValue(mockData)
      mockPrisma.count.mockResolvedValue(20)

      const result = await repository.findMany()

      expect(mockPrisma.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' }
      })
      expect(mockPrisma.count).toHaveBeenCalledWith({ where: { deletedAt: null } })
      expect(result.data).toHaveLength(2)
      expect(result.data[0]).toBeInstanceOf(TestEntity)
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 20,
        totalPages: 2,
        hasNext: true,
        hasPrev: false
      })
    })

    it('should handle custom pagination', async () => {
      const mockData = [
        {
          id: faker.string.uuid(),
          name: faker.person.fullName(),
          createdAt: faker.date.past(),
          updatedAt: faker.date.recent(),
          deletedAt: null
        }
      ]

      mockPrisma.findMany.mockResolvedValue(mockData)
      mockPrisma.count.mockResolvedValue(5)

      const result = await repository.findMany(undefined, {
        page: 2,
        limit: 3,
        orderBy: { field: 'name', direction: 'asc' }
      })

      expect(mockPrisma.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
        skip: 3,
        take: 3,
        orderBy: { name: 'asc' }
      })
      expect(result.pagination).toEqual({
        page: 2,
        limit: 3,
        total: 5,
        totalPages: 2,
        hasNext: false,
        hasPrev: true
      })
    })
  })

  describe('create', () => {
    it('should create and return an entity', async () => {
      const createData = { name: faker.person.fullName() }
      const mockCreatedData = {
        id: faker.string.uuid(),
        ...createData,
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
        deletedAt: null
      }

      mockPrisma.create.mockResolvedValue(mockCreatedData)

      const result = await repository.create(createData)

      expect(mockPrisma.create).toHaveBeenCalledWith({ data: createData })
      expect(result).toBeInstanceOf(TestEntity)
      expect(result.id).toBe(mockCreatedData.id)
      expect(result.name).toBe(createData.name)
    })
  })

  describe('update', () => {
    it('should update and return entity', async () => {
      const id = faker.string.uuid()
      const updateData = { name: 'Updated' }

      const mockUpdatedData = {
        id,
        ...updateData,
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
        deletedAt: null
      }

      mockPrisma.update.mockResolvedValue(mockUpdatedData)
      const result = await repository.update(id, updateData)

      expect(mockPrisma.update).toHaveBeenCalledWith({
        where: { id },
        data: updateData
      })
      expect(result).toBeInstanceOf(TestEntity)
      expect(result.name).toBe('Updated')
    })
  })

  describe('delete', () => {
    it('should soft delete entity', async () => {
      const id = faker.string.uuid()
      const mockDeleted = {
        id,
        name: faker.person.fullName(),
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
        deletedAt: faker.date.recent()
      }

      mockPrisma.update.mockResolvedValue(mockDeleted)

      const result = await repository.delete(id)

      expect(mockPrisma.update).toHaveBeenCalledWith({
        where: { id },
        data: { deletedAt: expect.any(Date) }
      })
      expect(result).toBeInstanceOf(TestEntity)
      expect(result.id).toBe(id)
    })
  })

  describe('hardDelete', () => {
    it('should permanently delete entity', async () => {
      const id = faker.string.uuid()
      const mockDeleted = {
        id,
        name: faker.person.fullName(),
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
        deletedAt: null
      }

      mockPrisma.delete.mockResolvedValue(mockDeleted)
      const result = await repository.hardDelete(id)

      expect(mockPrisma.delete).toHaveBeenCalledWith({ where: { id } })
      expect(result).toBeInstanceOf(TestEntity)
    })
  })

  describe('restore', () => {
    it('should restore soft-deleted entity', async () => {
      const id = faker.string.uuid()
      const mockRestored = {
        id,
        name: faker.person.fullName(),
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
        deletedAt: null
      }

      mockPrisma.update.mockResolvedValue(mockRestored)

      const result = await repository.restore(id)

      expect(mockPrisma.update).toHaveBeenCalledWith({
        where: { id },
        data: { deletedAt: null }
      })
      expect(result).toBeInstanceOf(TestEntity)
      expect(result.deletedAt).toBeNull()
    })
  })
})
