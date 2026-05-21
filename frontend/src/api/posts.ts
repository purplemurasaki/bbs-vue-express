export type PostImage = {
  id: number
  s3_key: string
  image_url: string | null
  sort_order: number
}

export type Post = {
  id: number
  author: string
  content: string
  created_at: string
  updated_at: string
  images: PostImage[]
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').toString().replace(/\/$/, '')

function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`
}

function firstN(s: string, n: number): string {
  return s.length <= n ? s : `${s.slice(0, n)}...`
}

async function parseErrorMessage(res: Response): Promise<string> {
  const text = await res.text().catch(() => '')
  if (!text) return `Request failed: ${res.status}`
  try {
    const body = JSON.parse(text) as { message?: string }
    if (typeof body.message === 'string' && body.message.length > 0) {
      return body.message
    }
  } catch {
    // not JSON
  }
  return text.length <= 200 ? text : `${text.slice(0, 200)}...`
}

async function parseJsonOrThrow<T>(res: Response): Promise<T> {
  try {
    return (await res.json()) as T
  } catch {
    const text = await res.text().catch(() => '')
    throw new Error(
      `Backend response is not valid JSON. First chars: ${firstN(text, 200)}`,
    )
  }
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(apiUrl(path), {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  })

  if (!res.ok) {
    throw new Error(await parseErrorMessage(res))
  }
  return parseJsonOrThrow<T>(res)
}

async function requestVoid(path: string, init?: RequestInit): Promise<void> {
  const res = await fetch(apiUrl(path), init)
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res))
  }
}

async function requestMultipartJson<T>(path: string, method: string, formData: FormData): Promise<T> {
  const res = await fetch(apiUrl(path), {
    method,
    body: formData,
  })
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res))
  }
  return parseJsonOrThrow<T>(res)
}

export async function getPosts(
  page: number,
): Promise<{ posts: Post[]; page: number; hasNext: boolean }> {
  return requestJson(`/api/posts?page=${encodeURIComponent(String(page))}`)
}

export async function getPost(id: number): Promise<Post> {
  return requestJson(`/api/posts/${id}`)
}

export async function createPost(formData: FormData): Promise<{ id: number }> {
  return requestMultipartJson('/api/posts', 'POST', formData)
}

export async function updatePost(id: number, formData: FormData): Promise<{ id: number }> {
  return requestMultipartJson(`/api/posts/${id}`, 'PUT', formData)
}

export async function deletePost(id: number): Promise<void> {
  return requestVoid(`/api/posts/${id}`, { method: 'DELETE' })
}
