/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentsTableTestHelper = {
  async addComment({
    id = 'comment-123',
    content = 'test comment',
    date = 'now',
    threadId = 'thread-123',
    owner = 'user-123',
    is_delete = false,
  }) {
    const query = {
      text: 'INSERT INTO comments VALUES ($1, $2, $3, $4, $5, $6)',
      values: [id, content, threadId, date, owner, is_delete],
    };

    await pool.query(query);
  },

  async findCommentsById(id) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM comments WHERE 1=1');
  },

  async likeComment({
    id = 'comment-like-123',
    commentId = 'comment-123',
    userId = 'user-123',
  }) {
    const query = {
      text: 'INSERT INTO comment_likes VALUES ($1, $2, $3)',
      values: [id, commentId, userId],
    };

    await pool.query(query);
  },

  async findCommentLikes(commentId, userId) {
    const query = {
      text: 'SELECT * FROM comment_likes WHERE comment_id = $1 AND user_id = $2',
      values: [commentId, userId],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTableCommentLike() {
    await pool.query('DELETE FROM comment_likes WHERE 1=1');
  },
};

module.exports = CommentsTableTestHelper;
