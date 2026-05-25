import type { Request, Response } from 'express'

import { parseIdParam } from '../lib/validation'
import { HttpError } from '../services/postService'
import type { LikeService } from '../services/likeService'

export function createLikesController(service: LikeService) {
  return {
    async add(req: Request, res: Response): Promise<void> {
      const parsed = parseIdParam(req.params.id)
      if (typeof parsed !== 'number') {
        throw new HttpError(parsed.status, parsed.message)
      }
      const result = await service.addLike(parsed)
      res.status(201).json(result)
    },
  }
}
