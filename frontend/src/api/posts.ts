export type Post = {
  id: number
  author: string
  content: string
  created_at: string
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').toString().replace(/\/$/, '')

function firstN(s: string, n: number): string {
  return s.length <= n ? s : `${s.slice(0, n)}...`
}

async function parseJsonOrThrow<T>(res: Response): Promise<T> {
  try {
    return (await res.json()) as T
  } catch {
    const text = await res.text().catch(() => '')
    // HTML（Viteのindex.html等）が返ってくるケースがあるため、JSONパース失敗を分かりやすくする
    throw new Error(
      `Backend response is not valid JSON. First chars: ${firstN(text, 200)}`,
    )
  }
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const base = API_BASE_URL
  const url = `${base}${path}`

  const res = await fetch(url, {
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
  return parseJsonOrThrow<T>(res)
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
  return parseJsonOrThrow<{ id: number }>(res)
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
  return parseJsonOrThrow<{ id: number }>(res)
}

