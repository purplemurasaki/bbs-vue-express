export type PostImageRow = {
  id: number
  post_id: number
  s3_key: string
  image_url: string | null
  sort_order: number
}

export type PostRow = {
  id: number
  author: string
  content: string
  created_at: Date
  updated_at: Date
}

export type PostImageDto = {
  id: number
  s3_key: string
  image_url: string | null
  sort_order: number
}

export type PostDto = {
  id: number
  author: string
  content: string
  created_at: string
  updated_at: string
  images: PostImageDto[]
}

export type ListPostsResult = {
  posts: PostDto[]
  page: number
  hasNext: boolean
}

export type UploadedImage = {
  s3_key: string
  image_url: string
  sort_order: number
}
