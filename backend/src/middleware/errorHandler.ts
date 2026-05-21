import type { ErrorRequestHandler } from 'express'

import { HttpError } from '../services/postService'

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ message: err.message })
    return
  }

  if (err && typeof err === 'object' && 'status' in err && 'message' in err) {
    const e = err as { status: number; message: string }
    res.status(e.status).json({ message: e.message })
    return
  }

  // eslint-disable-next-line no-console
  console.error(err)
  res.status(500).json({ message: 'Internal Server Error' })
}
