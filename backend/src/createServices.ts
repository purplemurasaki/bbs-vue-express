import type { AppConfig } from './config/env'
import { getPool } from './db/pool'
import { LikeRepository } from './repositories/likeRepository'
import { PostRepository } from './repositories/postRepository'
import { createImageStorage } from './services/imageStorage/createImageStorage'
import { LikeService } from './services/likeService'
import { PostService } from './services/postService'

export function createPostService(config: AppConfig): PostService {
  const pool = getPool(config)
  const repo = new PostRepository(pool)
  const likeRepo = new LikeRepository(pool)
  const storage = createImageStorage(config)
  return new PostService(repo, likeRepo, storage)
}

export function createLikeService(config: AppConfig): LikeService {
  const pool = getPool(config)
  const postRepo = new PostRepository(pool)
  const likeRepo = new LikeRepository(pool)
  return new LikeService(postRepo, likeRepo)
}
