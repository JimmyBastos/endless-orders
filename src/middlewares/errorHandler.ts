/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Request, Response, NextFunction } from 'express'
import { AppError } from '@/errors/AppError'

interface ErrorResponse {
  statusCode: number
  type: string
  message: string
  context?: AnyObject
}

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const type = error.constructor.name

  let statusCode = 500
  let message = 'Internal Server Error'
  let context: AnyObject | null = null

  if (error instanceof AppError) {
    statusCode = error.statusCode
    message = error.message
    context = error.context
  }

  const errorResponse: ErrorResponse = {
    statusCode,
    type,
    message
  }

  if (context) {
    errorResponse.context = context
  }

  res.on('finish', () => {
    const log = {
      timestamp: new Date().toISOString(),
      request: {
        id: req.headers['x-request-id']
      },
      response: {
        statusCode,
        body: errorResponse
      },
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    }

    if (process.env.NODE_ENV !== 'test') {
      console.error(
        `[${type.toUpperCase()}] ${req.method} ${req.url} ${statusCode}`,
        JSON.stringify(log, null, 2)
      )
    }
  })

  res.status(statusCode).json(errorResponse)
}

export const notFoundHandler = (req: Request, res: Response): void => {
  const errorResponse: ErrorResponse = {
    statusCode: 404,
    type: 'NotFoundError',
    message: `Route ${req.method} ${req.path} not found`
  }

  res.status(404).json(errorResponse)
}
