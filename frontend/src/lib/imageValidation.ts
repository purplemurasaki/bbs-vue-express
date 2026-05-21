export const MAX_IMAGES_PER_POST = 10
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024

export function validateImageFiles(files: File[]): string | null {
  if (files.length > MAX_IMAGES_PER_POST) {
    return `画像は最大${MAX_IMAGES_PER_POST}枚までです`
  }
  for (const file of files) {
    if (!file.type.startsWith('image/')) {
      return '画像ファイル（image/*）のみ選択できます'
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return `各画像は最大${MAX_IMAGE_BYTES / (1024 * 1024)}MBまでです`
    }
  }
  return null
}
