import type { Request, Response } from 'express'

import { parseIdParam, parsePageParam } from '../lib/validation'
import { HttpError, PostService } from '../services/postService'

export function createPostsController(service: PostService) {
  return {
    async list(req: Request, res: Response): Promise<void> {
      const parsed = parsePageParam(req.query.page)
      if ('status' in parsed) {
        throw new HttpError(parsed.status, parsed.message)
      }
      const result = await service.listPosts(parsed.page)
      res.status(200).json(result)
    },

    async get(req: Request, res: Response): Promise<void> {
      const parsed = parseIdParam(req.params.id)
      if (typeof parsed !== 'number') {
        throw new HttpError(parsed.status, parsed.message)
      }
      const post = await service.getPost(parsed)
      res.status(200).json(post)
    },

    async create(req: Request, res: Response): Promise<void> {
      const author = req.body?.author
      const content = req.body?.content
      const files = req.files as Express.Multer.File[] | undefined
      const result = await service.createPost(author, content, files)
      res.status(201).json(result)
    },

    async update(req: Request, res: Response): Promise<void> {
      const parsed = parseIdParam(req.params.id)
      if (typeof parsed !== 'number') {
        throw new HttpError(parsed.status, parsed.message)
      }
      const author = req.body?.author
      const content = req.body?.content
      const files = req.files as Express.Multer.File[] | undefined
      const replaceImages = Array.isArray(files) && files.length > 0
      const result = await service.updatePost(parsed, author, content, files, replaceImages)
      res.status(200).json(result)
    },

    async remove(req: Request, res: Response): Promise<void> {
      const parsed = parseIdParam(req.params.id)
      if (typeof parsed !== 'number') {
        throw new HttpError(parsed.status, parsed.message)
      }
      await service.deletePost(parsed)
      res.status(204).send()
    },
  }
}
