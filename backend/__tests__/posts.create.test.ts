import request from 'supertest'

import { createTestApp } from './helpers/createTestApp'

describe('POST /api/posts', () => {
  it('creates a post without images', async () => {
    const { app, store } = createTestApp()

    const res = await request(app)
      .post('/api/posts')
      .field('author', 'alice')
      .field('content', 'hello world')

    expect(res.status).toBe(201)
    expect(res.body.id).toBe(1)
    expect(store.posts).toHaveLength(1)
    expect(store.images).toHaveLength(0)
  })

  it('creates a post with images', async () => {
    const { app, store, storage } = createTestApp()

    const res = await request(app)
      .post('/api/posts')
      .field('author', 'bob')
      .field('content', 'with pic')
      .attach('images[]', Buffer.from('fake'), 'test.png')

    expect(res.status).toBe(201)
    expect(store.images).toHaveLength(1)
    expect(storage.uploaded).toHaveLength(1)
  })

  it('returns 400 when author is missing', async () => {
    const { app } = createTestApp()
    const res = await request(app).post('/api/posts').field('content', 'only content')
    expect(res.status).toBe(400)
  })

  it('returns 400 when content is empty', async () => {
    const { app } = createTestApp()
    const res = await request(app).post('/api/posts').field('author', 'alice').field('content', '  ')
    expect(res.status).toBe(400)
  })
})
