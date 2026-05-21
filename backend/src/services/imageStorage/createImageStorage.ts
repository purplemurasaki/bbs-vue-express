import type { AppConfig } from '../../config/env'
import { createLocalImageStorage } from './localStorage'
import { createS3ImageStorage } from './s3Storage'
import type { ImageStorage } from './types'

export function createImageStorage(config: AppConfig): ImageStorage {
  if (config.imageStorageMode === 's3') {
    return createS3ImageStorage(config)
  }
  return createLocalImageStorage(config)
}
