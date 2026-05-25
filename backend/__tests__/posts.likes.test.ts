import request from 'supertest'

import { seedStore } from './helpers/mockPostRepository'
import { createTestApp } from './helpers/createTestApp'

describe('POST /api/posts/:id/likes', () => {
  it('increments like_count on each request', async () => {
    const { app, store } = createTestApp()
    seedStore(store, 1)

    const res1 = await request(app).post('/api/posts/1/likes')
    expect(res1.status).toBe(201)
    expect(res1.body.like_count).toBe(1)

    const res2 = await request(app).post('/api/posts/1/likes')
    expect(res2.status).toBe(201)
    expect(res2.body.like_count).toBe(2)

    const res3 = await request(app).post('/api/posts/1/likes')
    expect(res3.status).toBe(201)
    expect(res3.body.like_count).toBe(3)
  })

  it('returns 404 when post not found', async () => {
    const { app } = createTestApp()
    const res = await request(app).post('/api/posts/999/likes')
    expect(res.status).toBe(404)
  })

  it('returns 400 for invalid id', async () => {
    const { app } = createTestApp()
    const res = await request(app).post('/api/posts/abc/likes')
    expect(res.status).toBe(400)
  })
})

describe('GET /api/posts with like_count', () => {
  it('includes like_count on each post', async () => {
    const { app, store } = createTestApp()
    seedStore(store, 2)
    await request(app).post('/api/posts/1/likes')
    await request(app).post('/api/posts/1/likes')
    await request(app).post('/api/posts/2/likes')

    const res = await request(app).get('/api/posts?page=1')
    expect(res.status).toBe(200)
    const post1 = res.body.posts.find((p: { id: number }) => p.id === 1)
    const post2 = res.body.posts.find((p: { id: number }) => p.id === 2)
    expect(post1.like_count).toBe(2)
    expect(post2.like_count).toBe(1)
  })

  it('returns like_count 0 when no likes', async () => {
    const { app, store } = createTestApp()
    seedStore(store, 1)

    const res = await request(app).get('/api/posts?page=1')
    expect(res.status).toBe(200)
    expect(res.body.posts[0].like_count).toBe(0)
  })
})
