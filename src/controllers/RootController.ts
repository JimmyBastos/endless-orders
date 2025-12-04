import { injectable } from 'tsyringe'
import type { Request, Response } from 'express'

@injectable()
class RootController {
  async index(req: Request, res: Response) {
    res.status(200).json({
      name: 'Endless API',
      version: '1.0.0',
      status: 'healthy',
      timestamp: new Date().toISOString()
    })
  }
}

export { RootController }
