export const MAX_AUTHOR_LENGTH = 100
export const MAX_IMAGES_PER_POST = 10
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024

export type ValidationError = {
  status: number
  message: string
}

export function validateAuthor(author: unknown): ValidationError | null {
  if (typeof author !== 'string' || author.trim() === '') {
    return { status: 400, message: 'author is required' }
  }
  if (author.length > MAX_AUTHOR_LENGTH) {
    return { status: 400, message: `author must be at most ${MAX_AUTHOR_LENGTH} characters` }
  }
  return null
}

export function validateContent(content: unknown): ValidationError | null {
  if (typeof content !== 'string' || content.trim() === '') {
    return { status: 400, message: 'content is required' }
  }
  return null
}

export function validateImages(files: Express.Multer.File[] | undefined): ValidationError | null {
  if (!files || files.length === 0) return null
  if (files.length > MAX_IMAGES_PER_POST) {
    return { status: 400, message: `at most ${MAX_IMAGES_PER_POST} images allowed` }
  }
  for (const file of files) {
    if (!file.mimetype.startsWith('image/')) {
      return { status: 400, message: 'only image/* files are allowed' }
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return { status: 400, message: `each image must be at most ${MAX_IMAGE_BYTES} bytes` }
    }
  }
  return null
}

export function parsePageParam(raw: unknown): { page: number } | ValidationError {
  if (raw === undefined || raw === '') {
    return { page: 1 }
  }
  const page = Number(raw)
  if (!Number.isInteger(page) || page < 1) {
    return { status: 400, message: 'page must be a positive integer' }
  }
  return { page }
}

export function parseIdParam(raw: string | string[]): number | ValidationError {
  const value = Array.isArray(raw) ? raw[0] : raw
  const id = Number(value)
  if (!Number.isInteger(id) || id < 1) {
    return { status: 400, message: 'invalid post id' }
  }
  return id
}
