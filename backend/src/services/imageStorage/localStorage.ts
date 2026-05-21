import fs from 'fs/promises'
import path from 'path'

import type { AppConfig } from '../../config/env'
import type { ImageStorage, StoredImage } from './types'

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_')
}

export function createLocalImageStorage(config: AppConfig): ImageStorage {
  const uploadDir = path.resolve(config.localUploadDir)
  const publicBase = config.localPublicBaseUrl

  return {
    buildPublicUrl(s3Key: string): string {
      return `${publicBase}/${s3Key.replace(/^\/+/, '')}`
    },

    async upload(postId: number, files: Express.Multer.File[], startOrder: number): Promise<StoredImage[]> {
      const results: StoredImage[] = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const ext = path.extname(file.originalname) || '.bin'
        const base = sanitizeFilename(path.basename(file.originalname, ext))
        const s3_key = `posts/${postId}/${Date.now()}-${startOrder + i}-${base}${ext}`
        const dest = path.join(uploadDir, s3_key)
        await fs.mkdir(path.dirname(dest), { recursive: true })
        await fs.writeFile(dest, file.buffer)
        results.push({
          s3_key,
          image_url: `${publicBase}/${s3_key}`,
        })
      }
      return results
    },

    async deleteKeys(keys: string[]): Promise<void> {
      for (const key of keys) {
        const dest = path.join(uploadDir, key)
        try {
          await fs.unlink(dest)
        } catch {
          // best-effort
        }
      }
    },
  }
}
