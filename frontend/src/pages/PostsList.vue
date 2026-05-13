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
          <span class="time">{{ p.created_at }}</span>
        </div>
        <div class="content">{{ p.content }}</div>
        <div class="actions">
          <RouterLink :to="`/posts/${p.id}/edit`">修正</RouterLink>
          <button type="button" class="danger" @click="onDelete(p.id)">削除</button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import { getPosts, type Post } from '../api/posts'

const posts = ref<Post[]>([])
const page = ref(1)
const hasNext = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)

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

function onDelete(_id: number) {
  // 削除APIは次工程でバックエンド実装に合わせて接続する
  alert('削除は未実装です（次工程でAPI接続します）')
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

