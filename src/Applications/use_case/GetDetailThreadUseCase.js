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
    const replies = await this._replyRepository.getRepliesByCommentIds(commentIds);
    const commentsWithReplies = this._associateRepliesToComments(comments, replies);
    return {
      ...thread,
      comments: commentsWithReplies,
    };
  }

  _associateRepliesToComments(comments, replies) {
    const mapReplies = {};
    replies.forEach((reply) => {
      if (!(reply.comment_id in mapReplies)) {
        mapReplies[reply.comment_id] = [];
      }
      mapReplies[reply.comment_id].push({
        id: reply.id,
        username: reply.username,
        date: reply.date,
        content: reply.content,
      });
    });
    return comments.map((comment) => ({
      ...comment,
      replies: mapReplies[comment.id] || [],
    }));
  }
}

module.exports = GetDetailThreadUseCase;
