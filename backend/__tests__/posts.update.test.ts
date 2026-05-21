import request from 'supertest'

import { createTestApp } from './helpers/createTestApp'

describe('PUT /api/posts/:id', () => {
  beforeEach(() => {
    // each test sets up store
  })

  it('updates text only and keeps images', async () => {
    const { app, store } = createTestApp()
    store.posts.push({
      id: 1,
      author: 'alice',
      content: 'old',
      created_at: new Date(),
      updated_at: new Date(),
    })
    store.images.push({
      id: 1,
      post_id: 1,
      s3_key: 'posts/1/old.jpg',
      image_url: 'https://cdn.test/posts/1/old.jpg',
      sort_order: 0,
    })

    const res = await request(app)
      .put('/api/posts/1')
      .field('author', 'alice2')
      .field('content', 'new')

    expect(res.status).toBe(200)
    expect(store.posts[0].author).toBe('alice2')
    expect(store.images).toHaveLength(1)
  })

  it('replaces images when new files are uploaded', async () => {
    const { app, store, storage } = createTestApp()
    store.posts.push({
      id: 1,
      author: 'alice',
      content: 'c',
      created_at: new Date(),
      updated_at: new Date(),
    })
    store.images.push({
      id: 1,
      post_id: 1,
      s3_key: 'posts/1/old.jpg',
      image_url: 'https://cdn.test/posts/1/old.jpg',
      sort_order: 0,
    })

    const res = await request(app)
      .put('/api/posts/1')
      .field('author', 'alice')
      .field('content', 'c')
      .attach('images[]', Buffer.from('new'), { filename: 'new.png', contentType: 'image/png' })

    expect(res.status).toBe(200)
    expect(store.images).toHaveLength(1)
    expect(store.images[0].s3_key).toContain('mock')
    expect(storage.deleted.length).toBeGreaterThan(0)
  })

  it('returns 404 when post does not exist', async () => {
    const { app } = createTestApp()
    const res = await request(app)
      .put('/api/posts/99')
      .field('author', 'a')
      .field('content', 'b')
    expect(res.status).toBe(404)
  })
})
