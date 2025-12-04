import 'reflect-metadata'
import '@/container'

import { errorHandler, notFoundHandler } from '@/middlewares/errorHandler'
import { requestLogger } from '@/middlewares/requestLogger'
import { routes } from '@/routes'
import cors from 'cors'
import express, { type Express } from 'express'

const app: Express = express()

// Authentication layer
// client key authentication (x-api-key header)
// context to help identify the initial request (x-request-id | x-correlation-id | x-debug-id)

app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(requestLogger)
app.use(routes)
app.use(errorHandler) // improments in the error handling to gracefully handle async errors
app.use(notFoundHandler)

export default app
