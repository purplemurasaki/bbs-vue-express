import type { Pool, RowDataPacket } from 'mysql2/promise'

type LikeCountRow = RowDataPacket & {
  post_id: number
  like_count: number
}

export class LikeRepository {
  constructor(private readonly pool: Pool) {}

  async insertLike(postId: number): Promise<void> {
    await this.pool.query(
      `INSERT INTO post_likes (post_id) VALUES (?)`,
      [postId],
    )
  }

  async countByPostId(postId: number): Promise<number> {
    const map = await this.countByPostIds([postId])
    return map.get(postId) ?? 0
  }

  async countByPostIds(postIds: number[]): Promise<Map<number, number>> {
    const result = new Map<number, number>()
    if (postIds.length === 0) return result

    const placeholders = postIds.map(() => '?').join(',')
    const [rows] = await this.pool.query<LikeCountRow[]>(
      `SELECT post_id, COUNT(*) AS like_count
       FROM post_likes
       WHERE post_id IN (${placeholders})
       GROUP BY post_id`,
      postIds,
    )
    for (const row of rows) {
      result.set(row.post_id, Number(row.like_count))
    }
    return result
  }
}
