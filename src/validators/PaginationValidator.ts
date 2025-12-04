import { z } from 'zod/v4'

export const PaginationValidator = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  orderBy: z
    .object({
      field: z.string(),
      direction: z.enum(['asc', 'desc'])
    })
    .optional()
})
