import 'reflect-metadata'
import { prisma } from '@/repositories/prisma/prisma'
import { isIntegrationTest, cleanAllTables } from './utils/testHelpers'
import { execSync } from 'child_process'

beforeEach(() => {
  jest.clearAllMocks()
})

if (isIntegrationTest()) {
  beforeAll(async () => {
    execSync('npx prisma db push', { stdio: 'ignore' })
  })

  afterAll(async () => {
    await cleanAllTables()
    await prisma.$disconnect()
  })
}

global.console = {
  ...console
}
