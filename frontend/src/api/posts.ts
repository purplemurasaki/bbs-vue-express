export type Post = {
  id: number
  author: string
  content: string
  created_at: string
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Request failed: ${res.status} ${text}`)
  }
  return (await res.json()) as T
}

export async function getPosts(page: number): Promise<{ posts: Post[]; page: number; hasNext: boolean }> {
  return requestJson(`/api/posts?page=${encodeURIComponent(String(page))}`)
}

export async function createPost(formData: FormData): Promise<{ id: number }> {
  // multipart/form-data なので Content-Type はブラウザに任せる
  const res = await fetch(`${API_BASE_URL}/api/posts`, {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Request failed: ${res.status} ${text}`)
  }
  return (await res.json()) as { id: number }
}

export async function updatePost(
  id: number,
  formData: FormData,
): Promise<{ id: number }> {
  const res = await fetch(`${API_BASE_URL}/api/posts/${id}`, {
    method: 'PUT',
    body: formData,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Request failed: ${res.status} ${text}`)
  }
  return (await res.json()) as { id: number }
}

