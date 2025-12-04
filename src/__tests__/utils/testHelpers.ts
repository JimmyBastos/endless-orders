import { prisma } from '@/repositories/prisma/prisma'

export const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

export const timeoutPromise = (ms: number): Promise<never> =>
  new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms))

export const isIntegrationTest = () => {
  const testPath = expect.getState().testPath || ''
  return testPath.includes('.integration.')
}

export const cleanAllTables = async () => {
  await prisma.order.deleteMany()
  await prisma.orderItem.deleteMany()
}
