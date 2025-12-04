import request from 'supertest'
import app from '@/app'

describe('RootController', () => {
  describe('GET /', () => {
    it('should return API information', async () => {
      const response = await request(app).get('/').expect(200)

      expect(response.body).toEqual({
        name: 'Endless API',
        version: '1.0.0',
        status: 'healthy',
        timestamp: expect.any(String)
      })
    })
  })
})
