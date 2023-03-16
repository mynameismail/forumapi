const DeleteReply = require('../../Domains/replies/entities/DeleteReply');

class DeleteReplyUseCase {
  constructor({ replyRepository, commentRepository, threadRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const deleteReply = new DeleteReply(useCasePayload);
    await this._threadRepository.checkIfThreadIdExist(deleteReply.threadId);
    await this._commentRepository.checkIfCommentIdExist(deleteReply.commentId);
    await this._replyRepository.verifyReplyOwner(deleteReply.replyId, deleteReply.owner);
    await this._replyRepository.deleteReply(deleteReply.replyId);
  }
}

module.exports = DeleteReplyUseCase;
