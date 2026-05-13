import { Router } from 'express'

export const postsRouter = Router()

// 今はひな型のため、未実装を 501 で返す（フロントのAPIプレースホルダと整合させる）
postsRouter.get('/api/posts', (_req, res) => {
  res.status(501).json({ message: 'Not Implemented' })
})

postsRouter.post('/api/posts', (_req, res) => {
  res.status(501).json({ message: 'Not Implemented' })
})

postsRouter.put('/api/posts/:id', (_req, res) => {
  res.status(501).json({ message: 'Not Implemented' })
})

postsRouter.delete('/api/posts/:id', (_req, res) => {
  res.status(501).json({ message: 'Not Implemented' })
})

