<template>
  <div>
    <h2>投稿作成</h2>

    <form class="form" @submit.prevent="onSubmit">
      <label class="label">
        投稿者
        <input v-model="author" type="text" required />
      </label>

      <label class="label">
        投稿内容
        <textarea v-model="content" rows="6" required />
      </label>

      <label class="label">
        画像（複数可）
        <input type="file" multiple accept="image/*" @change="onFilesSelected" />
      </label>

      <div class="file-names" v-if="fileNames.length > 0">
        <div v-for="n in fileNames" :key="n">- {{ n }}</div>
      </div>

      <div class="buttons">
        <button type="submit" :disabled="submitting">
          {{ submitting ? '送信中...' : '作成' }}
        </button>
        <RouterLink to="/">戻る</RouterLink>
      </div>

      <p v-if="error" class="error">{{ error }}</p>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { createPost } from '../api/posts'

const router = useRouter()

const author = ref('')
const content = ref('')
const files = ref<File[]>([])
const fileNames = ref<string[]>([])
const submitting = ref(false)
const error = ref<string | null>(null)

function onFilesSelected(e: Event) {
  const input = e.target as HTMLInputElement
  const list = input.files ? Array.from(input.files) : []
  files.value = list
  fileNames.value = list.map((f) => f.name)
}

async function onSubmit() {
  error.value = null
  submitting.value = true
  try {
    const formData = new FormData()
    formData.append('author', author.value)
    formData.append('content', content.value)
    for (const f of files.value) {
      // バックエンド実装に合わせてフィールド名を後で調整可能
      formData.append('images[]', f)
    }
    const res = await createPost(formData)
    await router.push(`/posts/${res.id}/edit`)
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.label {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.file-names {
  opacity: 0.8;
  font-size: 14px;
}

.buttons {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 6px;
}

.error {
  color: #b91c1c;
}
</style>

