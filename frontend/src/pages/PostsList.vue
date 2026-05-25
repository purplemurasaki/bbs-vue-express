<template>
  <div>
    <h2>投稿一覧</h2>

    <div class="pager">
      <button type="button" :disabled="page <= 1" @click="page--">前へ</button>
      <span>Page {{ page }}</span>
      <button type="button" :disabled="!hasNext" @click="page++">次へ</button>
    </div>

    <p v-if="loading">読み込み中...</p>
    <p v-else-if="error" class="error">{{ error }}</p>

    <ul v-else class="list">
      <li v-for="p in posts" :key="p.id" class="item">
        <div class="meta">
          <span class="author">{{ p.author }}</span>
          <span class="time">{{ formatDateTime(p.created_at) }}</span>
        </div>
        <div class="content">{{ p.content }}</div>
        <div v-if="sortedImages(p).length > 0" class="images">
          <img
            v-for="img in sortedImages(p)"
            :key="img.id"
            :src="img.image_url!"
            :alt="`${p.author}の投稿画像`"
            class="thumb"
          />
        </div>
        <div class="actions">
          <button type="button" :disabled="likingId === p.id" @click="onLike(p.id)">
            {{ likingId === p.id ? 'いいね中...' : `いいね (${p.like_count})` }}
          </button>
          <RouterLink :to="`/posts/${p.id}/edit`">修正</RouterLink>
          <button type="button" class="danger" :disabled="deletingId === p.id" @click="onDelete(p.id)">
            {{ deletingId === p.id ? '削除中...' : '削除' }}
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import { deletePost, getPosts, likePost, type Post, type PostImage } from '../api/posts'
import { formatDateTime } from '../lib/datetime'

const posts = ref<Post[]>([])
const page = ref(1)
const hasNext = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)
const deletingId = ref<number | null>(null)
const likingId = ref<number | null>(null)

function sortedImages(post: Post): PostImage[] {
  return [...post.images]
    .filter((img) => img.image_url)
    .sort((a, b) => a.sort_order - b.sort_order)
}

async function load() {
  loading.value = true
  error.value = null
  try {
    const res = await getPosts(page.value)
    posts.value = res.posts
    hasNext.value = res.hasNext
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}

async function onLike(id: number) {
  likingId.value = id
  error.value = null
  try {
    const res = await likePost(id)
    const post = posts.value.find((p) => p.id === id)
    if (post) {
      post.like_count = res.like_count
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    likingId.value = null
  }
}

async function onDelete(id: number) {
  if (!confirm('この投稿を削除しますか？')) return
  deletingId.value = id
  error.value = null
  try {
    await deletePost(id)
    await load()
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    deletingId.value = null
  }
}

onMounted(load)
watch(page, load)
</script>

<style scoped>
.pager {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 12px 0;
}

.list {
  padding: 0;
  margin: 0;
  list-style: none;
}

.item {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px;
  margin: 12px 0;
}

.meta {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 14px;
  opacity: 0.8;
}

.content {
  margin-top: 8px;
  white-space: pre-wrap;
}

.images {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.thumb {
  max-width: 200px;
  max-height: 200px;
  object-fit: contain;
  border-radius: 4px;
  border: 1px solid #eee;
}

.actions {
  display: flex;
  gap: 12px;
  margin-top: 12px;
}

.danger {
  color: #b91c1c;
  border: 1px solid #b91c1c;
  background: transparent;
  padding: 6px 10px;
  border-radius: 6px;
}

.error {
  color: #b91c1c;
}
</style>
