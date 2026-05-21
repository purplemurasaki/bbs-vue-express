import type { AppConfig } from './config/env'
import { getPool } from './db/pool'
import { PostRepository } from './repositories/postRepository'
import { createImageStorage } from './services/imageStorage/createImageStorage'
import { PostService } from './services/postService'

export function createPostService(config: AppConfig): PostService {
  const pool = getPool(config)
  const repo = new PostRepository(pool)
  const storage = createImageStorage(config)
  return new PostService(repo, storage)
}
