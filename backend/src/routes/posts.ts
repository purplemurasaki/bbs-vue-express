import { Router } from 'express'

import { createLikesController } from '../controllers/likesController'
import { createPostsController } from '../controllers/postsController'
import { asyncHandler } from '../middleware/asyncHandler'
import { uploadPostImages } from '../middleware/upload'
import type { LikeService } from '../services/likeService'
import type { PostService } from '../services/postService'

export function createPostsRouter(
  postService: PostService,
  likeService: LikeService,
): Router {
  const router = Router()
  const ctrl = createPostsController(postService)
  const likesCtrl = createLikesController(likeService)

  router.get('/api/posts', asyncHandler(ctrl.list))
  router.get('/api/posts/:id', asyncHandler(ctrl.get))
  router.post('/api/posts', uploadPostImages, asyncHandler(ctrl.create))
  router.put('/api/posts/:id', uploadPostImages, asyncHandler(ctrl.update))
  router.delete('/api/posts/:id', asyncHandler(ctrl.remove))
  router.post('/api/posts/:id/likes', asyncHandler(likesCtrl.add))

  return router
}
