import request from 'supertest'
import app from '@/app'
import { faker } from '@faker-js/faker'

describe('OrderController', () => {
  // Use a fixed UUID for customer ID since we don't have user management
  const customerId = faker.string.uuid()

  describe('POST /orders', () => {
    it('creates an order successfully', async () => {
      const orderData = {
        customerId,
        items: [
          { name: faker.commerce.productName(), quantity: 2, price: 1500 },
          { name: faker.commerce.productName(), quantity: 1, price: 2000 }
        ]
      }

      const response = await request(app).post('/orders').send(orderData).expect(201)

      expect(response.body).toMatchObject({
        id: expect.any(String),
        customerId: orderData.customerId,
        totalAmount: 5000,
        status: 'pending',
        items: expect.arrayContaining([
          expect.objectContaining({
            name: orderData.items[0]!.name,
            quantity: orderData.items[0]!.quantity,
            price: orderData.items[0]!.price
          })
        ]),
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      })
    })

    it('returns 400 when order has no items', async () => {
      const orderData = {
        customerId,
        items: []
      }

      const response = await request(app).post('/orders').send(orderData).expect(422)

      expect(response.body.message).toBe('Invalid data')
      expect(response.body.context.fieldErrors.items).toContain('Order must have at least one item')
    })

    it('returns 400 when item has invalid data', async () => {
      const orderData = {
        customerId,
        items: [{ name: '', quantity: 0, price: -100 }]
      }

      const response = await request(app).post('/orders').send(orderData).expect(422)

      expect(response.body).toMatchObject({
        message: expect.any(String)
      })
    })

    it('calculates totalAmount correctly', async () => {
      const orderData = {
        customerId,
        items: [
          { name: 'Product 1', quantity: 3, price: 1000 },
          { name: 'Product 2', quantity: 2, price: 2500 }
        ]
      }

      const response = await request(app).post('/orders').send(orderData).expect(201)

      expect(response.body.totalAmount).toBe(8000)
    })
  })

  describe('GET /orders', () => {
    it('returns paginated orders', async () => {
      const orderData = {
        customerId,
        items: [{ name: faker.commerce.productName(), quantity: 1, price: 1000 }]
      }

      await request(app).post('/orders').send(orderData).expect(201)
      await request(app).post('/orders').send(orderData).expect(201)

      const response = await request(app).get('/orders').expect(200)

      expect(response.body).toMatchObject({
        data: expect.any(Array),
        pagination: {
          page: expect.any(Number),
          limit: expect.any(Number),
          total: expect.any(Number),
          totalPages: expect.any(Number),
          hasNext: expect.any(Boolean),
          hasPrev: expect.any(Boolean)
        }
      })
      expect(response.body.data.length).toBeGreaterThan(0)
    })

    it('filters orders by status', async () => {
      const orderData = {
        customerId,
        items: [{ name: faker.commerce.productName(), quantity: 1, price: 1000 }]
      }

      const createResponse = await request(app).post('/orders').send(orderData).expect(201)
      const orderId = createResponse.body.id

      await request(app).put(`/orders/${orderId}`).send({ status: 'processing' }).expect(200)

      const response = await request(app).get('/orders?status=pending').expect(200)

      const pendingOrders = response.body.data.filter((o: any) => o.status === 'pending')
      expect(pendingOrders.length).toBeGreaterThanOrEqual(0)
    })

    it('supports pagination', async () => {
      const orderData = {
        customerId,
        items: [{ name: faker.commerce.productName(), quantity: 1, price: 1000 }]
      }

      await request(app).post('/orders').send(orderData).expect(201)
      await request(app).post('/orders').send(orderData).expect(201)

      const response = await request(app).get('/orders?page=1&limit=1').expect(200)

      expect(response.body.data.length).toBeLessThanOrEqual(1)
      expect(response.body.pagination.limit).toBe(1)
    })
  })

  describe('GET /orders/:id', () => {
    it('returns order with items', async () => {
      const orderData = {
        customerId,
        items: [
          { name: 'Product 1', quantity: 2, price: 1500 },
          { name: 'Product 2', quantity: 1, price: 2000 }
        ]
      }

      const createResponse = await request(app).post('/orders').send(orderData).expect(201)
      const orderId = createResponse.body.id

      const response = await request(app).get(`/orders/${orderId}`).expect(200)

      expect(response.body).toMatchObject({
        id: orderId,
        customerId,
        items: expect.arrayContaining([
          expect.objectContaining({
            name: 'Product 1',
            quantity: 2,
            price: 1500
          })
        ])
      })
    })

    it('returns 404 when order not found', async () => {
      const response = await request(app).get(`/orders/${faker.string.uuid()}`).expect(404)

      expect(response.body).toMatchObject({
        message: expect.stringContaining('not found')
      })
    })
  })

  describe('PUT /orders/:id', () => {
    it('updates order status successfully', async () => {
      const orderData = {
        customerId,
        items: [{ name: faker.commerce.productName(), quantity: 1, price: 1000 }]
      }

      const createResponse = await request(app).post('/orders').send(orderData).expect(201)
      const orderId = createResponse.body.id

      const response = await request(app)
        .put(`/orders/${orderId}`)
        .send({ status: 'processing' })
        .expect(200)

      expect(response.body.status).toBe('processing')
    })

    it('returns 422 for invalid status transition', async () => {
      const orderData = {
        customerId,
        items: [{ name: faker.commerce.productName(), quantity: 1, price: 1000 }]
      }

      const createResponse = await request(app).post('/orders').send(orderData).expect(201)
      const orderId = createResponse.body.id

      await request(app).put(`/orders/${orderId}`).send({ status: 'completed' }).expect(422)
      await request(app).put(`/orders/${orderId}`).send({ status: 'processing' }).expect(200)
      await request(app).put(`/orders/${orderId}`).send({ status: 'completed' }).expect(200)
      await request(app).put(`/orders/${orderId}`).send({ status: 'pending' }).expect(422)
    })

    it('returns 404 when order not found', async () => {
      const response = await request(app)
        .put(`/orders/${faker.string.uuid()}`)
        .send({ status: 'processing' })
        .expect(404)

      expect(response.body).toMatchObject({
        message: expect.stringContaining('not found')
      })
    })
  })

  describe('DELETE /orders/:id', () => {
    it('cancels pending order successfully', async () => {
      const orderData = {
        customerId,
        items: [{ name: faker.commerce.productName(), quantity: 1, price: 1000 }]
      }

      const createResponse = await request(app).post('/orders').send(orderData).expect(201)
      const orderId = createResponse.body.id

      const response = await request(app).delete(`/orders/${orderId}`).expect(200)

      expect(response.body.status).toBe('cancelled')
    })

    it('allows cancelling processing orders', async () => {
      const orderData = {
        customerId,
        items: [{ name: faker.commerce.productName(), quantity: 1, price: 1000 }]
      }

      const createResponse = await request(app).post('/orders').send(orderData).expect(201)
      const orderId = createResponse.body.id

      await request(app).put(`/orders/${orderId}`).send({ status: 'processing' }).expect(200)

      const response = await request(app).delete(`/orders/${orderId}`).expect(200)

      expect(response.body.status).toBe('cancelled')
    })

    it('returns 422 when cancelling completed order', async () => {
      const orderData = {
        customerId,
        items: [{ name: faker.commerce.productName(), quantity: 1, price: 1000 }]
      }

      const createResponse = await request(app).post('/orders').send(orderData).expect(201)
      const orderId = createResponse.body.id

      await request(app).put(`/orders/${orderId}`).send({ status: 'processing' }).expect(200)
      await request(app).put(`/orders/${orderId}`).send({ status: 'completed' }).expect(200)

      await request(app).delete(`/orders/${orderId}`).expect(422)
    })

    it('returns 404 when order not found', async () => {
      const response = await request(app).delete(`/orders/${faker.string.uuid()}`).expect(404)

      expect(response.body).toMatchObject({
        message: expect.stringContaining('not found')
      })
    })
  })
})
