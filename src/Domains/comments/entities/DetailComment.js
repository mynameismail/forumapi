/* eslint class-methods-use-this: ["error", { "exceptMethods": ["_verifyPayload"] }] */

class DetailComment {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      id,
      username,
      date,
      content,
      is_delete,
      replies,
    } = payload;

    this.id = id;
    this.username = username;
    this.date = date;
    this.content = is_delete ? '**komentar telah dihapus**' : content;
    this.replies = replies;
  }

  _verifyPayload({
    id,
    username,
    date,
    content,
    is_delete,
    replies,
  }) {
    if (!id || !username || !date || !content || is_delete === undefined || !replies) {
      throw new Error('DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string'
      || typeof username !== 'string'
      || typeof date !== 'string'
      || typeof content !== 'string'
      || typeof is_delete !== 'boolean'
      || !Array.isArray(replies)) {
      throw new Error('DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DetailComment;
