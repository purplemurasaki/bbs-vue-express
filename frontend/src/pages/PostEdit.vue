<template>
  <div>
    <h2>投稿修正</h2>

    <p v-if="loading">読み込み中...</p>
    <p v-else-if="loadError" class="error">
      {{ loadError }}
      <RouterLink to="/">一覧へ戻る</RouterLink>
    </p>
    <form v-else class="form" @submit.prevent="onSubmit">
      <label class="label">
        投稿者
        <input v-model="author" type="text" required />
      </label>

      <label class="label">
        投稿内容
        <textarea v-model="content" rows="6" required />
      </label>

      <div v-if="existingImages.length > 0" class="existing-images">
        <p class="hint">現在の画像</p>
        <div class="images">
          <img
            v-for="img in existingImages"
            :key="img.id"
            :src="img.image_url!"
            :alt="`既存画像 ${img.sort_order + 1}`"
            class="thumb"
          />
        </div>
      </div>

      <label class="label">
        画像（新しい画像を選ぶと、既存画像はすべて置き換わります。未選択ならテキストのみ更新）
        <input type="file" multiple accept="image/*" @change="onFilesSelected" />
      </label>

      <div class="file-names" v-if="fileNames.length > 0">
        <div v-for="n in fileNames" :key="n">- {{ n }}</div>
      </div>

      <div class="buttons">
        <button type="submit" :disabled="submitting">
          {{ submitting ? '更新中...' : '更新' }}
        </button>
        <RouterLink to="/">戻る</RouterLink>
      </div>

      <p v-if="error" class="error">{{ error }}</p>
    </form>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { getPost, updatePost, type PostImage } from '../api/posts'
import { validateImageFiles } from '../lib/imageValidation'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const loadError = ref<string | null>(null)
const submitting = ref(false)
const error = ref<string | null>(null)

const author = ref('')
const content = ref('')
const files = ref<File[]>([])
const fileNames = ref<string[]>([])
const existingImages = ref<PostImage[]>([])

function postId(): number {
  return Number(route.params.id)
}

function onFilesSelected(e: Event) {
  const input = e.target as HTMLInputElement
  const list = input.files ? Array.from(input.files) : []
  files.value = list
  fileNames.value = list.map((f) => f.name)
}

onMounted(async () => {
  const id = postId()
  if (!Number.isInteger(id) || id < 1) {
    loadError.value = '不正な投稿IDです'
    loading.value = false
    return
  }
  try {
    const post = await getPost(id)
    author.value = post.author
    content.value = post.content
    existingImages.value = [...post.images]
      .filter((img) => img.image_url)
      .sort((a, b) => a.sort_order - b.sort_order)
  } catch (e) {
    loadError.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
})

async function onSubmit() {
  error.value = null
  const validationError = validateImageFiles(files.value)
  if (validationError) {
    error.value = validationError
    return
  }

  submitting.value = true
  try {
    const id = postId()
    const formData = new FormData()
    formData.append('author', author.value)
    formData.append('content', content.value)
    for (const f of files.value) {
      formData.append('images[]', f)
    }
    await updatePost(id, formData)
    await router.push('/')
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

.hint {
  margin: 0 0 6px;
  font-size: 14px;
  opacity: 0.8;
}

.images {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.thumb {
  max-width: 160px;
  max-height: 160px;
  object-fit: contain;
  border-radius: 4px;
  border: 1px solid #eee;
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
