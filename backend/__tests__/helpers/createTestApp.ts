import { createApp } from '../../src/app'
import { PostService } from '../../src/services/postService'
import {
  asPostRepository,
  createEmptyStore,
  type MockPostStore,
  MockPostRepository,
} from './mockPostRepository'
import { createMockImageStorage } from './mockImageStorage'

export function createTestApp(store: MockPostStore = createEmptyStore()) {
  const repo = new MockPostRepository(store)
  const storage = createMockImageStorage()
  const service = new PostService(asPostRepository(repo), storage)
  return { app: createApp({ postService: service }), store, storage }
}
