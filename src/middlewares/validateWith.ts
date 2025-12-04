/* eslint-disable @typescript-eslint/no-unused-vars */
import { AppError } from '@/errors/AppError'
import { ValidationError } from '@/errors/ValidationError'
import type { NextFunction, Request, Response } from 'express'
import type { ZodAny, ZodArray, ZodObject } from 'zod'
import { z, ZodMiniArray, ZodMiniObject } from 'zod/mini'

export type Validator = ZodObject | ZodMiniObject | ZodArray | ZodMiniArray | ZodAny

export const validateWith =
  (validator: Validator) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = validator.safeParse(req.body)

    if (!result.success) {
      throw new ValidationError(z.flattenError(result.error))
    }

    req.body = result.data

    next()
  }
