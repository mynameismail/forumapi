/* eslint class-methods-use-this: ["error", {
  "exceptMethods": ["_associateLikesAndRepliesToComments"],
}] */

const DetailThread = require('../../Domains/threads/entities/DetailThread');
const DetailComment = require('../../Domains/comments/entities/DetailComment');
const DetailReply = require('../../Domains/replies/entities/DetailReply');

class GetDetailThreadUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(threadId) {
    const thread = await this._threadRepository.getDetailThreadById(threadId);
    const comments = await this._commentRepository.getCommentsByThreadId(threadId);
    const commentIds = comments.map((comment) => comment.id);
    const likeCounts = await this._commentRepository.getLikeCountsByCommentIds(commentIds);
    const replies = await this._replyRepository.getRepliesByCommentIds(commentIds);
    const detailComments = this._associateLikesAndRepliesToComments(comments, likeCounts, replies);
    return new DetailThread({
      ...thread,
      comments: detailComments,
    });
  }

  _associateLikesAndRepliesToComments(comments, likeCounts, replies) {
    return comments.map((comment) => {
      const findLike = likeCounts.find((like) => like.comment_id === comment.id);
      const likeCount = findLike !== undefined ? Number(findLike.like_count) : 0;

      const commentReplies = replies.filter((reply) => reply.comment_id === comment.id)
        .map((reply) => new DetailReply(reply));

      return new DetailComment({
        ...comment,
        likeCount,
        replies: commentReplies,
      });
    });
  }
}

module.exports = GetDetailThreadUseCase;
