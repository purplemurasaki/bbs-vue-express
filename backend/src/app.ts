import express from 'express'
import cors from 'cors'

import { postsRouter, healthRouter } from './routes/index'

export function createApp() {
  const app = express()

  // JSON受信（投稿作成はmultipartのため、routes側で扱う予定）
  app.use(express.json())

  const corsOrigin = process.env.CORS_ORIGIN
  if (corsOrigin) {
    app.use(
      cors({
        origin: corsOrigin,
      }),
    )
  }

  app.use(healthRouter)
  app.use(postsRouter)

  return app
}

