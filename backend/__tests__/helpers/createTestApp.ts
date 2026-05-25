import { createApp } from '../../src/app'
import { LikeService } from '../../src/services/likeService'
import { PostService } from '../../src/services/postService'
import {
  asLikeRepository,
  asPostRepository,
  createEmptyStore,
  type MockPostStore,
  MockLikeRepository,
  MockPostRepository,
} from './mockPostRepository'
import { createMockImageStorage } from './mockImageStorage'

export function createTestApp(store: MockPostStore = createEmptyStore()) {
  const repo = new MockPostRepository(store)
  const likeRepo = new MockLikeRepository(store)
  const storage = createMockImageStorage()
  const postService = new PostService(asPostRepository(repo), asLikeRepository(likeRepo), storage)
  const likeService = new LikeService(asPostRepository(repo), asLikeRepository(likeRepo))
  return { app: createApp({ postService, likeService }), store, storage }
}
