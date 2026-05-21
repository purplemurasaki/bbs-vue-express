export type ImageStorageMode = 'local' | 's3'

export type AppConfig = {
  port: number
  corsOrigin: string | undefined
  mysql: {
    host: string
    port: number
    database: string
    user: string
    password: string
  }
  imageStorageMode: ImageStorageMode
  localUploadDir: string
  localPublicBaseUrl: string
  awsRegion: string
  s3Bucket: string
  cloudfrontBaseUrl: string
}

function parsePort(value: string | undefined, fallback: number): number {
  if (value === undefined || value === '') return fallback
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

function parseImageStorageMode(value: string | undefined): ImageStorageMode {
  if (value === 's3') return 's3'
  return 'local'
}

export function loadConfig(): AppConfig {
  return {
    port: parsePort(process.env.PORT, 3000),
    corsOrigin: process.env.CORS_ORIGIN?.trim() || undefined,
    mysql: {
      host: process.env.MYSQL_HOST ?? '127.0.0.1',
      port: parsePort(process.env.MYSQL_PORT, 3306),
      database: process.env.MYSQL_DATABASE ?? 'bbs',
      user: process.env.MYSQL_USER ?? 'root',
      password: process.env.MYSQL_PASSWORD ?? '',
    },
    imageStorageMode: parseImageStorageMode(process.env.IMAGE_STORAGE_MODE),
    localUploadDir: process.env.LOCAL_UPLOAD_DIR ?? 'uploads',
    localPublicBaseUrl: (process.env.LOCAL_PUBLIC_BASE_URL ?? 'http://localhost:3000/uploads').replace(
      /\/$/,
      '',
    ),
    awsRegion: process.env.AWS_REGION ?? 'ap-northeast-1',
    s3Bucket: process.env.S3_BUCKET ?? '',
    cloudfrontBaseUrl: (process.env.CLOUDFRONT_BASE_URL ?? '').replace(/\/$/, ''),
  }
}
