import type { ImageStorage, StoredImage } from '../../src/services/imageStorage/types'

export function createMockImageStorage(): ImageStorage & {
  uploaded: StoredImage[][]
  deleted: string[][]
} {
  const uploaded: StoredImage[][] = []
  const deleted: string[][] = []

  return {
    uploaded,
    deleted,
    buildPublicUrl(s3Key: string): string {
      return `https://cdn.test/${s3Key}`
    },
    async upload(postId: number, files: Express.Multer.File[], startOrder: number): Promise<StoredImage[]> {
      const batch = files.map((f, i) => ({
        s3_key: `posts/${postId}/mock-${startOrder + i}-${f.originalname}`,
        image_url: `https://cdn.test/posts/${postId}/mock-${startOrder + i}-${f.originalname}`,
      }))
      uploaded.push(batch)
      return batch
    },
    async deleteKeys(keys: string[]): Promise<void> {
      deleted.push([...keys])
    },
  }
}
