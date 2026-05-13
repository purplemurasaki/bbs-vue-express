<template>
  <div>
    <h2>投稿修正</h2>

    <p v-if="loading">読み込み中...</p>
    <form v-else class="form" @submit.prevent="onSubmit">
      <label class="label">
        投稿者
        <input v-model="author" type="text" required />
      </label>

      <label class="label">
        投稿内容
        <textarea v-model="content" rows="6" required />
      </label>

      <label class="label">
        画像追加（差分更新方針は未確定）
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

import { updatePost } from '../api/posts'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const submitting = ref(false)
const error = ref<string | null>(null)

const author = ref('')
const content = ref('')
const files = ref<File[]>([])
const fileNames = ref<string[]>([])

function onFilesSelected(e: Event) {
  const input = e.target as HTMLInputElement
  const list = input.files ? Array.from(input.files) : []
  files.value = list
  fileNames.value = list.map((f) => f.name)
}

onMounted(async () => {
  // 次工程で「取得API」も接続する前提のため、ひな型は空で進める
  loading.value = false
})

async function onSubmit() {
  error.value = null
  submitting.value = true
  try {
    const id = Number(route.params.id)
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

