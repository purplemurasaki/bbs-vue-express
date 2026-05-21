import mysql from 'mysql2/promise'

import type { AppConfig } from '../config/env'

let pool: mysql.Pool | null = null

export function getPool(config: AppConfig): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: config.mysql.host,
      port: config.mysql.port,
      database: config.mysql.database,
      user: config.mysql.user,
      password: config.mysql.password,
      waitForConnections: true,
      connectionLimit: 10,
      charset: 'utf8mb4',
    })
  }
  return pool
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end()
    pool = null
  }
}
