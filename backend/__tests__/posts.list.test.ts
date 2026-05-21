import request from 'supertest'

import { seedStore } from './helpers/mockPostRepository'
import { createTestApp } from './helpers/createTestApp'

describe('GET /api/posts', () => {
  it('returns first page with 10 items and hasNext', async () => {
    const { app, store } = createTestApp()
    seedStore(store, 12)

    const res = await request(app).get('/api/posts?page=1')
    expect(res.status).toBe(200)
    expect(res.body.posts).toHaveLength(10)
    expect(res.body.page).toBe(1)
    expect(res.body.hasNext).toBe(true)
  })

  it('returns second page with remaining items', async () => {
    const { app, store } = createTestApp()
    seedStore(store, 12)

    const res = await request(app).get('/api/posts?page=2')
    expect(res.status).toBe(200)
    expect(res.body.posts).toHaveLength(2)
    expect(res.body.hasNext).toBe(false)
  })

  it('defaults to page 1 when page is omitted', async () => {
    const { app, store } = createTestApp()
    seedStore(store, 3)

    const res = await request(app).get('/api/posts')
    expect(res.status).toBe(200)
    expect(res.body.page).toBe(1)
    expect(res.body.posts).toHaveLength(3)
  })

  it('returns 400 for invalid page', async () => {
    const { app } = createTestApp()
    const res = await request(app).get('/api/posts?page=0')
    expect(res.status).toBe(400)
  })
})
