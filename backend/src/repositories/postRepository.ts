import type { Pool, PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise'

import type { PostImageRow, PostRow } from '../types/post'

const PAGE_SIZE = 10

type PostRowPacket = PostRow & RowDataPacket
type PostImageRowPacket = PostImageRow & RowDataPacket

export class PostRepository {
  constructor(private readonly pool: Pool) {}

  async listPosts(page: number): Promise<{ rows: PostRow[]; hasNext: boolean }> {
    const offset = (page - 1) * PAGE_SIZE
    const limit = PAGE_SIZE + 1
    const [rows] = await this.pool.query<PostRowPacket[]>(
      `SELECT id, author, content, created_at, updated_at
       FROM posts
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset],
    )
    const hasNext = rows.length > PAGE_SIZE
    return { rows: rows.slice(0, PAGE_SIZE), hasNext }
  }

  async findPostById(id: number): Promise<PostRow | null> {
    const [rows] = await this.pool.query<PostRowPacket[]>(
      `SELECT id, author, content, created_at, updated_at
       FROM posts WHERE id = ?`,
      [id],
    )
    return rows[0] ?? null
  }

  async findImagesByPostIds(postIds: number[]): Promise<PostImageRow[]> {
    if (postIds.length === 0) return []
    const placeholders = postIds.map(() => '?').join(',')
    const [rows] = await this.pool.query<PostImageRowPacket[]>(
      `SELECT id, post_id, s3_key, image_url, sort_order
       FROM post_images
       WHERE post_id IN (${placeholders})
       ORDER BY post_id, sort_order ASC`,
      postIds,
    )
    return rows
  }

  async findImagesByPostId(postId: number): Promise<PostImageRow[]> {
    return this.findImagesByPostIds([postId])
  }

  async createPost(
    conn: PoolConnection,
    author: string,
    content: string,
  ): Promise<number> {
    const [result] = await conn.query<ResultSetHeader>(
      `INSERT INTO posts (author, content) VALUES (?, ?)`,
      [author, content],
    )
    return Number(result.insertId)
  }

  async insertImages(
    conn: PoolConnection,
    postId: number,
    images: { s3_key: string; image_url: string; sort_order: number }[],
  ): Promise<void> {
    if (images.length === 0) return
    const values = images.map((img) => [postId, img.s3_key, img.image_url, img.sort_order])
    const placeholders = values.map(() => '(?, ?, ?, ?)').join(', ')
    const flat = values.flat()
    await conn.query(
      `INSERT INTO post_images (post_id, s3_key, image_url, sort_order) VALUES ${placeholders}`,
      flat,
    )
  }

  async updatePost(
    conn: PoolConnection,
    id: number,
    author: string,
    content: string,
  ): Promise<boolean> {
    const [result] = await conn.query<ResultSetHeader>(
      `UPDATE posts SET author = ?, content = ? WHERE id = ?`,
      [author, content, id],
    )
    return result.affectedRows > 0
  }

  async deleteImagesByPostId(conn: PoolConnection, postId: number): Promise<string[]> {
    const [rows] = await conn.query<PostImageRowPacket[]>(
      `SELECT s3_key FROM post_images WHERE post_id = ?`,
      [postId],
    )
    const keys = rows.map((r) => r.s3_key)
    await conn.query(`DELETE FROM post_images WHERE post_id = ?`, [postId])
    return keys
  }

  async deletePost(id: number): Promise<{ deleted: boolean; imageKeys: string[] }> {
    const conn = await this.pool.getConnection()
    try {
      await conn.beginTransaction()
      const imageKeys = await this.deleteImagesByPostId(conn, id)
      const [result] = await conn.query<ResultSetHeader>(`DELETE FROM posts WHERE id = ?`, [id])
      await conn.commit()
      return { deleted: result.affectedRows > 0, imageKeys }
    } catch (e) {
      await conn.rollback()
      throw e
    } finally {
      conn.release()
    }
  }

  async withTransaction<T>(fn: (conn: PoolConnection) => Promise<T>): Promise<T> {
    const conn = await this.pool.getConnection()
    try {
      await conn.beginTransaction()
      const result = await fn(conn)
      await conn.commit()
      return result
    } catch (e) {
      await conn.rollback()
      throw e
    } finally {
      conn.release()
    }
  }
}

export { PAGE_SIZE }
