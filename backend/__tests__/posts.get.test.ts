import request from 'supertest'

import { createTestApp } from './helpers/createTestApp'

describe('GET /api/posts/:id', () => {
  it('returns post with images', async () => {
    const { app, store } = createTestApp()
    store.posts.push({
      id: 1,
      author: 'alice',
      content: 'hello',
      created_at: new Date('2026-05-21T12:00:00.000Z'),
      updated_at: new Date('2026-05-21T12:00:00.000Z'),
    })
    store.images.push({
      id: 10,
      post_id: 1,
      s3_key: 'posts/1/a.jpg',
      image_url: null,
      sort_order: 0,
    })

    const res = await request(app).get('/api/posts/1')
    expect(res.status).toBe(200)
    expect(res.body.author).toBe('alice')
    expect(res.body.images).toHaveLength(1)
    expect(res.body.images[0].image_url).toBe('https://cdn.test/posts/1/a.jpg')
  })

  it('returns 404 when not found', async () => {
    const { app } = createTestApp()
    const res = await request(app).get('/api/posts/999')
    expect(res.status).toBe(404)
  })

  it('returns 400 for invalid id', async () => {
    const { app } = createTestApp()
    const res = await request(app).get('/api/posts/abc')
    expect(res.status).toBe(400)
  })
})
