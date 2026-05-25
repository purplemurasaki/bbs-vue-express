import type { LikeRepository } from '../repositories/likeRepository'
import type { PostRepository } from '../repositories/postRepository'
import { HttpError } from './postService'

export class LikeService {
  constructor(
    private readonly postRepo: PostRepository,
    private readonly likeRepo: LikeRepository,
  ) {}

  async addLike(postId: number): Promise<{ like_count: number }> {
    const post = await this.postRepo.findPostById(postId)
    if (!post) {
      throw new HttpError(404, 'post not found')
    }
    await this.likeRepo.insertLike(postId)
    const like_count = await this.likeRepo.countByPostId(postId)
    return { like_count }
  }
}
