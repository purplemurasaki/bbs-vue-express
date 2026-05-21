import { Router } from 'express'

import { createPostsController } from '../controllers/postsController'
import { asyncHandler } from '../middleware/asyncHandler'
import { uploadPostImages } from '../middleware/upload'
import type { PostService } from '../services/postService'

export function createPostsRouter(service: PostService): Router {
  const router = Router()
  const ctrl = createPostsController(service)

  router.get('/api/posts', asyncHandler(ctrl.list))
  router.get('/api/posts/:id', asyncHandler(ctrl.get))
  router.post('/api/posts', uploadPostImages, asyncHandler(ctrl.create))
  router.put('/api/posts/:id', uploadPostImages, asyncHandler(ctrl.update))
  router.delete('/api/posts/:id', asyncHandler(ctrl.remove))

  return router
}
