const LikeComment = require('../../Domains/comments/entities/LikeComment');

class LikeCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const likeComment = new LikeComment(useCasePayload);
    await this._threadRepository.checkIfThreadIdExist(likeComment.threadId);
    await this._commentRepository.checkIfCommentIdExist(likeComment.commentId);
    const liked = await this._commentRepository
      .checkIfCommentLiked(likeComment.commentId, likeComment.userId);
    if (liked) {
      await this._commentRepository.deleteCommentLike(likeComment.commentId, likeComment.userId);
    } else {
      await this._commentRepository.addCommentLike(likeComment.commentId, likeComment.userId);
    }
  }
}

module.exports = LikeCommentUseCase;
