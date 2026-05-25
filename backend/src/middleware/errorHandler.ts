import type { ErrorRequestHandler } from 'express'

import { HttpError } from '../services/postService'

function logServerError(err: unknown): void {
  if (err && typeof err === 'object') {
    const e = err as { code?: string; errno?: number; sqlMessage?: string; sql?: string }
    if (e.code || e.sqlMessage) {
      // eslint-disable-next-line no-console
      console.error('Unhandled error:', {
        code: e.code,
        errno: e.errno,
        sqlMessage: e.sqlMessage,
        sql: e.sql,
      })
      return
    }
  }
  // eslint-disable-next-line no-console
  console.error(err)
}

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

  logServerError(err)
  res.status(500).json({ message: 'Internal Server Error' })
}
