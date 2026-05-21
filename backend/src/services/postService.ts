import type { PostRepository } from '../repositories/postRepository'
import type { ImageStorage } from './imageStorage/types'
import type { ListPostsResult, PostDto, PostImageRow, PostRow } from '../types/post'
import { validateAuthor, validateContent, validateImages } from '../lib/validation'

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'HttpError'
  }
}

function toIso(d: Date): string {
  return d.toISOString()
}

function mapImage(row: PostImageRow, storage: ImageStorage): PostDto['images'][number] {
  const image_url = row.image_url ?? storage.buildPublicUrl(row.s3_key)
  return {
    id: row.id,
    s3_key: row.s3_key,
    image_url,
    sort_order: row.sort_order,
  }
}

function mapPost(row: PostRow, images: PostImageRow[], storage: ImageStorage): PostDto {
  return {
    id: row.id,
    author: row.author,
    content: row.content,
    created_at: toIso(row.created_at),
    updated_at: toIso(row.updated_at),
    images: images.map((img) => mapImage(img, storage)),
  }
}

export class PostService {
  constructor(
    private readonly repo: PostRepository,
    private readonly storage: ImageStorage,
  ) {}

  async listPosts(page: number): Promise<ListPostsResult> {
    const { rows, hasNext } = await this.repo.listPosts(page)
    const postIds = rows.map((r) => r.id)
    const allImages = await this.repo.findImagesByPostIds(postIds)
    const imagesByPost = new Map<number, PostImageRow[]>()
    for (const img of allImages) {
      const list = imagesByPost.get(img.post_id) ?? []
      list.push(img)
      imagesByPost.set(img.post_id, list)
    }
    return {
      posts: rows.map((row) => mapPost(row, imagesByPost.get(row.id) ?? [], this.storage)),
      page,
      hasNext,
    }
  }

  async getPost(id: number): Promise<PostDto> {
    const row = await this.repo.findPostById(id)
    if (!row) {
      throw new HttpError(404, 'post not found')
    }
    const images = await this.repo.findImagesByPostId(id)
    return mapPost(row, images, this.storage)
  }

  async createPost(
    author: string,
    content: string,
    files: Express.Multer.File[] | undefined,
  ): Promise<{ id: number }> {
    const authorErr = validateAuthor(author)
    if (authorErr) throw new HttpError(authorErr.status, authorErr.message)
    const contentErr = validateContent(content)
    if (contentErr) throw new HttpError(contentErr.status, contentErr.message)
    const imagesErr = validateImages(files)
    if (imagesErr) throw new HttpError(imagesErr.status, imagesErr.message)

    const imageFiles = files ?? []

    const id = await this.repo.withTransaction(async (conn) => {
      const postId = await this.repo.createPost(conn, author.trim(), content)
      if (imageFiles.length > 0) {
        const stored = await this.storage.upload(postId, imageFiles, 0)
        await this.repo.insertImages(
          conn,
          postId,
          stored.map((s, i) => ({
            s3_key: s.s3_key,
            image_url: s.image_url,
            sort_order: i,
          })),
        )
      }
      return postId
    })

    return { id }
  }

  async updatePost(
    id: number,
    author: string,
    content: string,
    files: Express.Multer.File[] | undefined,
    replaceImages: boolean,
  ): Promise<{ id: number }> {
    const authorErr = validateAuthor(author)
    if (authorErr) throw new HttpError(authorErr.status, authorErr.message)
    const contentErr = validateContent(content)
    if (contentErr) throw new HttpError(contentErr.status, contentErr.message)
    if (replaceImages) {
      const imagesErr = validateImages(files)
      if (imagesErr) throw new HttpError(imagesErr.status, imagesErr.message)
    }

    const existing = await this.repo.findPostById(id)
    if (!existing) {
      throw new HttpError(404, 'post not found')
    }

    let keysToDelete: string[] = []

    await this.repo.withTransaction(async (conn) => {
      const updated = await this.repo.updatePost(conn, id, author.trim(), content)
      if (!updated) {
        throw new HttpError(404, 'post not found')
      }

      if (replaceImages) {
        keysToDelete = await this.repo.deleteImagesByPostId(conn, id)
        const imageFiles = files ?? []
        if (imageFiles.length > 0) {
          const stored = await this.storage.upload(id, imageFiles, 0)
          await this.repo.insertImages(
            conn,
            id,
            stored.map((s, i) => ({
              s3_key: s.s3_key,
              image_url: s.image_url,
              sort_order: i,
            })),
          )
        }
      }
    })

    if (replaceImages && keysToDelete.length > 0) {
      await this.storage.deleteKeys(keysToDelete).catch(() => undefined)
    }

    return { id }
  }

  async deletePost(id: number): Promise<void> {
    const { deleted, imageKeys } = await this.repo.deletePost(id)
    if (!deleted) {
      throw new HttpError(404, 'post not found')
    }
    if (imageKeys.length > 0) {
      await this.storage.deleteKeys(imageKeys).catch(() => undefined)
    }
  }
}
