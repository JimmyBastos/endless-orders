import request from 'supertest'
import express from 'express'
import { AppError } from '@/errors/AppError'
import { errorHandler, notFoundHandler } from '../errorHandler'
import { ValidationError } from '@/errors/ValidationError'

describe('Error Handler Middleware', () => {
  let app: express.Application

  beforeEach(() => {
    app = express()
    app.use(express.json())

    app.get('/input-error', () => {
      throw new AppError('Bad Request Error', 400, { context: 'test' })
    })

    app.get('/validation-error', () => {
      throw new ValidationError({ fieldErrors: { email: ['Invalid email'] } })
    })

    app.get('/generic-error', () => {
      throw new Error('Generic error')
    })

    app.get('/type-error', () => {
      throw new TypeError('Type error occurred')
    })

    app.get('/test-success', (req, res) => {
      res.json({ message: 'success' })
    })

    app.use(notFoundHandler)
    app.use(errorHandler)
  })

  describe('Error handling', () => {
    test.each([
      ['/input-error', 400, 'AppError', 'Bad Request Error', { context: 'test' }],
      [
        '/validation-error',
        422,
        'ValidationError',
        'Invalid data',
        { fieldErrors: { email: ['Invalid email'] }, formErrors: [] }
      ],
      ['/generic-error', 500, 'Error', 'Internal Server Error', null],
      ['/type-error', 500, 'TypeError', 'Internal Server Error', null],
      ['/not-found', 404, 'NotFoundError', 'Route GET /not-found not found', null]
    ])('should handle %s error correctly', async (route, statusCode, type, message, context) => {
      const response = await request(app).get(route).expect(statusCode)

      expect(response.body).toMatchObject({
        statusCode,
        type,
        message
      })

      if (context) {
        expect(response.body).toMatchObject({ context })
      }
    })
  })

  describe('Success handling', () => {
    it('should not interfere with successful requests', async () => {
      const response = await request(app).get('/test-success').expect(200)

      expect(response.body).toEqual({ message: 'success' })
    })
  })
})
