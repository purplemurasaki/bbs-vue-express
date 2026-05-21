import express from 'express'
import cors from 'cors'
import path from 'path'

import { loadConfig, type AppConfig } from './config/env'
import { createPostService } from './createServices'
import { errorHandler } from './middleware/errorHandler'
import { healthRouter } from './routes/health'
import { createPostsRouter } from './routes/posts'
import type { PostService } from './services/postService'

export type CreateAppOptions = {
  config?: AppConfig
  postService?: PostService
}

export function createApp(options?: CreateAppOptions | AppConfig) {
  const app = express()
  const opts: CreateAppOptions =
    options && 'mysql' in options ? { config: options } : (options ?? {})
  const cfg = opts.config ?? loadConfig()

  app.use(express.json())

  if (cfg.corsOrigin) {
    app.use(
      cors({
        origin: cfg.corsOrigin,
      }),
    )
  }

  if (cfg.imageStorageMode === 'local') {
    const uploadPath = path.resolve(cfg.localUploadDir)
    app.use('/uploads', express.static(uploadPath))
  }

  app.use(healthRouter)

  const postService = opts.postService ?? createPostService(cfg)
  app.use(createPostsRouter(postService))

  app.use(errorHandler)

  return app
}
