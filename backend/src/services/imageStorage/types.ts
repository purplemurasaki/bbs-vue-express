export type StoredImage = {
  s3_key: string
  image_url: string
}

export type ImageStorage = {
  upload(postId: number, files: Express.Multer.File[], startOrder: number): Promise<StoredImage[]>
  deleteKeys(keys: string[]): Promise<void>
  buildPublicUrl(s3Key: string): string
}
