import { Router } from 'express'

export const healthRouter = Router()

healthRouter.get('/api/health', (_req, res) => {
  res.status(200).json({ ok: true })
})

