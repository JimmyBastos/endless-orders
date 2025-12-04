import { randomUUID } from 'crypto'
import type { Request, Response, NextFunction } from 'express'

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const requestId = (req.headers['x-request-id'] as string) || randomUUID()

  req.headers['x-request-id'] = requestId

  const startTime = Date.now()

  res.on('finish', () => {
    const duration = Date.now() - startTime
    const log = {
      request: {
        id: requestId,
        method: req.method,
        url: req.url,
        ip: req.ip || '',
        query: req.query,
        body: req.method !== 'GET' ? req.body : undefined,
        headers: req.headers
      },
      response: {
        statusCode: res.statusCode
      },
      timestamp: {
        end: new Date().toISOString(),
        start: new Date(startTime).toISOString(),
        duration
      }
    }

    if (process.env.NODE_ENV !== 'test') {
      console.info(
        `[REQUEST] ${req.method} ${req.url} ${res.statusCode}`,
        JSON.stringify(log, null, 2)
      )
    }
  })

  next()
}
