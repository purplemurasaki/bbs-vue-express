import multer from 'multer'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: 10,
    fileSize: 5 * 1024 * 1024,
  },
})

export const uploadPostImages = upload.array('images[]', 10)
