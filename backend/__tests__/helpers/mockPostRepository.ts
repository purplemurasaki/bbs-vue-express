import type { Pool, PoolConnection } from 'mysql2/promise'

import type { PostRepository } from '../../src/repositories/postRepository'
import type { PostImageRow, PostRow } from '../../src/types/post'

export type MockPostLike = {
  id: number
  post_id: number
  created_at: Date
}

export type MockPostStore = {
  posts: PostRow[]
  images: PostImageRow[]
  likes: MockPostLike[]
  nextPostId: number
  nextImageId: number
  nextLikeId: number
}

export function createEmptyStore(): MockPostStore {
  return {
    posts: [],
    images: [],
    likes: [],
    nextPostId: 1,
    nextImageId: 1,
    nextLikeId: 1,
  }
}

export function seedStore(store: MockPostStore, count: number): void {
  const now = new Date('2026-05-21T12:00:00.000Z')
  for (let i = 0; i < count; i++) {
    const id = store.nextPostId++
    store.posts.push({
      id,
      author: `user${id}`,
      content: `content ${id}`,
      created_at: new Date(now.getTime() - id * 3600_000),
      updated_at: new Date(now.getTime() - id * 3600_000),
    })
  }
}

export class MockPostRepository implements Pick<
  PostRepository,
  | 'listPosts'
  | 'findPostById'
  | 'findImagesByPostIds'
  | 'findImagesByPostId'
  | 'createPost'
  | 'insertImages'
  | 'updatePost'
  | 'deleteImagesByPostId'
  | 'deletePost'
  | 'withTransaction'
> {
  constructor(public readonly store: MockPostStore) {}

  async listPosts(page: number): Promise<{ rows: PostRow[]; hasNext: boolean }> {
    const PAGE_SIZE = 10
    const sorted = [...this.store.posts].sort(
      (a, b) => b.created_at.getTime() - a.created_at.getTime(),
    )
    const offset = (page - 1) * PAGE_SIZE
    const slice = sorted.slice(offset, offset + PAGE_SIZE + 1)
    const hasNext = slice.length > PAGE_SIZE
    return { rows: slice.slice(0, PAGE_SIZE), hasNext }
  }

  async findPostById(id: number): Promise<PostRow | null> {
    return this.store.posts.find((p) => p.id === id) ?? null
  }

  async findImagesByPostIds(postIds: number[]): Promise<PostImageRow[]> {
    return this.store.images
      .filter((img) => postIds.includes(img.post_id))
      .sort((a, b) => a.sort_order - b.sort_order)
  }

  async findImagesByPostId(postId: number): Promise<PostImageRow[]> {
    return this.findImagesByPostIds([postId])
  }

  async createPost(_conn: PoolConnection, author: string, content: string): Promise<number> {
    const id = this.store.nextPostId++
    const now = new Date()
    this.store.posts.push({ id, author, content, created_at: now, updated_at: now })
    return id
  }

  async insertImages(
    _conn: PoolConnection,
    postId: number,
    images: { s3_key: string; image_url: string; sort_order: number }[],
  ): Promise<void> {
    for (const img of images) {
      this.store.images.push({
        id: this.store.nextImageId++,
        post_id: postId,
        s3_key: img.s3_key,
        image_url: img.image_url,
        sort_order: img.sort_order,
      })
    }
  }

  async updatePost(
    _conn: PoolConnection,
    id: number,
    author: string,
    content: string,
  ): Promise<boolean> {
    const post = this.store.posts.find((p) => p.id === id)
    if (!post) return false
    post.author = author
    post.content = content
    post.updated_at = new Date()
    return true
  }

  async deleteImagesByPostId(_conn: PoolConnection, postId: number): Promise<string[]> {
    const keys = this.store.images.filter((i) => i.post_id === postId).map((i) => i.s3_key)
    this.store.images = this.store.images.filter((i) => i.post_id !== postId)
    return keys
  }

  async deletePost(id: number): Promise<{ deleted: boolean; imageKeys: string[] }> {
    const imageKeys = this.store.images.filter((i) => i.post_id === id).map((i) => i.s3_key)
    const before = this.store.posts.length
    this.store.posts = this.store.posts.filter((p) => p.id !== id)
    this.store.images = this.store.images.filter((i) => i.post_id !== id)
    this.store.likes = this.store.likes.filter((l) => l.post_id !== id)
    return { deleted: this.store.posts.length < before, imageKeys }
  }

  async withTransaction<T>(fn: (conn: PoolConnection) => Promise<T>): Promise<T> {
    return fn({} as PoolConnection)
  }
}

export class MockLikeRepository {
  constructor(public readonly store: MockPostStore) {}

  async insertLike(postId: number): Promise<void> {
    const now = new Date()
    this.store.likes.push({
      id: this.store.nextLikeId++,
      post_id: postId,
      created_at: now,
    })
  }

  async countByPostId(postId: number): Promise<number> {
    return this.store.likes.filter((l) => l.post_id === postId).length
  }

  async countByPostIds(postIds: number[]): Promise<Map<number, number>> {
    const result = new Map<number, number>()
    for (const postId of postIds) {
      const count = this.store.likes.filter((l) => l.post_id === postId).length
      if (count > 0) {
        result.set(postId, count)
      }
    }
    return result
  }
}

// Satisfy PostRepository type for PostService constructor
export function asPostRepository(mock: MockPostRepository): PostRepository {
  return mock as unknown as PostRepository
}

export function asLikeRepository(mock: MockLikeRepository): import('../../src/repositories/likeRepository').LikeRepository {
  return mock as unknown as import('../../src/repositories/likeRepository').LikeRepository
}

export function dummyPool(): Pool {
  return {} as Pool
}
