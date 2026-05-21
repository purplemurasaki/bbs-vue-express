import request from 'supertest'

import { createTestApp } from './helpers/createTestApp'

describe('DELETE /api/posts/:id', () => {
  it('deletes post and triggers storage cleanup', async () => {
    const { app, store, storage } = createTestApp()
    store.posts.push({
      id: 1,
      author: 'alice',
      content: 'x',
      created_at: new Date(),
      updated_at: new Date(),
    })
    store.images.push({
      id: 1,
      post_id: 1,
      s3_key: 'posts/1/a.jpg',
      image_url: 'https://cdn.test/posts/1/a.jpg',
      sort_order: 0,
    })

    const res = await request(app).delete('/api/posts/1')
    expect(res.status).toBe(204)
    expect(store.posts).toHaveLength(0)
    expect(storage.deleted).toEqual([['posts/1/a.jpg']])
  })

  it('returns 404 when not found', async () => {
    const { app } = createTestApp()
    const res = await request(app).delete('/api/posts/42')
    expect(res.status).toBe(404)
  })
})
