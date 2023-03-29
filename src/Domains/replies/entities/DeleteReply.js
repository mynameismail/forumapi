/* eslint class-methods-use-this: ["error", { "exceptMethods": ["_verifyPayload"] }] */

class DeleteReply {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      threadId,
      commentId,
      replyId,
      owner,
    } = payload;

    this.threadId = threadId;
    this.commentId = commentId;
    this.replyId = replyId;
    this.owner = owner;
  }

  _verifyPayload({
    threadId,
    commentId,
    replyId,
    owner,
  }) {
    if (!threadId || !commentId || !replyId || !owner) {
      throw new Error('DELETE_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof threadId !== 'string'
      || typeof commentId !== 'string'
      || typeof replyId !== 'string'
      || typeof owner !== 'string') {
      throw new Error('DELETE_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DeleteReply;
