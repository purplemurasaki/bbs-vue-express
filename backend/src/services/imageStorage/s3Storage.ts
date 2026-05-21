import { DeleteObjectsCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import path from 'path'

import type { AppConfig } from '../../config/env'
import type { ImageStorage, StoredImage } from './types'

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_')
}

export function createS3ImageStorage(config: AppConfig): ImageStorage {
  if (!config.s3Bucket) {
    throw new Error('S3_BUCKET is required when IMAGE_STORAGE_MODE=s3')
  }

  const client = new S3Client({ region: config.awsRegion })
  const bucket = config.s3Bucket
  const cdnBase = config.cloudfrontBaseUrl

  return {
    buildPublicUrl(s3Key: string): string {
      if (cdnBase) {
        return `${cdnBase}/${s3Key.replace(/^\/+/, '')}`
      }
      return `https://${bucket}.s3.${config.awsRegion}.amazonaws.com/${s3Key}`
    },

    async upload(postId: number, files: Express.Multer.File[], startOrder: number): Promise<StoredImage[]> {
      const results: StoredImage[] = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const ext = path.extname(file.originalname) || '.bin'
        const base = sanitizeFilename(path.basename(file.originalname, ext))
        const s3_key = `posts/${postId}/${Date.now()}-${startOrder + i}-${base}${ext}`
        await client.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: s3_key,
            Body: file.buffer,
            ContentType: file.mimetype || 'application/octet-stream',
          }),
        )
        results.push({
          s3_key,
          image_url: this.buildPublicUrl(s3_key),
        })
      }
      return results
    },

    async deleteKeys(keys: string[]): Promise<void> {
      if (keys.length === 0) return
      try {
        await client.send(
          new DeleteObjectsCommand({
            Bucket: bucket,
            Delete: {
              Objects: keys.map((Key) => ({ Key })),
            },
          }),
        )
      } catch {
        // best-effort
      }
    },
  }
}
