/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentsTableTestHelper = {
  async addComment({
    id = 'comment-123',
    content = 'test comment',
    threadId = 'thread-123',
    owner = 'user-123',
    is_delete = false,
  }) {
    const createdAt = new Date().toISOString();
    const query = {
      text: 'INSERT INTO comments VALUES ($1, $2, $3, $4, $5, $6)',
      values: [id, content, threadId, createdAt, owner, is_delete],
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
};

module.exports = CommentsTableTestHelper;
