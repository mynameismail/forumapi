const AddReply = require('../../../Domains/replies/entities/AddReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const pool = require('../../database/postgres/pool');

describe('ReplyRepositoryPostgres', () => {
  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addReply function', () => {
    it('should persist add reply and return added reply correctly', async () => {
      // Arrange
      const mockUserId = 'user-123';
      const mockCommentId = 'comment-123';
      const mockThreadId = 'thread-123';
      await UsersTableTestHelper.addUser({ id: mockUserId });
      await ThreadsTableTestHelper.addThread({ id: mockThreadId });
      await CommentsTableTestHelper.addComment({ id: mockCommentId });
      const reply = new AddReply({
        content: 'test reply',
        commentId: mockCommentId,
        threadId: mockThreadId,
        owner: mockUserId,
      });
      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedReply = await replyRepositoryPostgres.addReply(reply);

      // Assert
      const replies = await RepliesTableTestHelper.findRepliesById('reply-123');
      expect(replies).toHaveLength(1);
      expect(addedReply).toStrictEqual(new AddedReply({
        id: 'reply-123',
        content: 'test reply',
        owner: mockUserId,
      }));
    });
  });

  describe('verifyReplyOwner function', () => {
    it('should throw NotFoundError when reply not found', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
      // Action and Assert
      await expect(replyRepositoryPostgres.verifyReplyOwner('reply-123', 'user-123'))
        .rejects.toThrowError(NotFoundError);
    });

    it('should throw AuthorizationError when user is not owner', async () => {
      // Arrange
      const mockUserId = 'user-123';
      const mockThreadId = 'thread-123';
      const mockCommentId = 'comment-123';
      const mockReplyId = 'reply-123';
      await UsersTableTestHelper.addUser({ id: mockUserId });
      await ThreadsTableTestHelper.addThread({ id: mockThreadId });
      await CommentsTableTestHelper.addComment({ id: mockCommentId });
      await RepliesTableTestHelper.addReply({
        id: mockReplyId,
        commentId: mockCommentId,
        owner: mockUserId,
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action and Assert
      await expect(replyRepositoryPostgres.verifyReplyOwner(mockReplyId, 'user-456'))
        .rejects.toThrowError(AuthorizationError);
    });

    it('should not throw NotFoundError nor AuthorizationError when reply found and user is owner', async () => {
      // Arrange
      const mockUserId = 'user-123';
      const mockThreadId = 'thread-123';
      const mockCommentId = 'comment-123';
      const mockReplyId = 'reply-123';
      await UsersTableTestHelper.addUser({ id: mockUserId });
      await ThreadsTableTestHelper.addThread({ id: mockThreadId });
      await CommentsTableTestHelper.addComment({ id: mockCommentId });
      await RepliesTableTestHelper.addReply({
        id: mockReplyId,
        commentId: mockCommentId,
        owner: mockUserId,
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action and Assert
      await expect(replyRepositoryPostgres.verifyReplyOwner(mockReplyId, mockUserId))
        .resolves.not.toThrowError(NotFoundError);
      await expect(replyRepositoryPostgres.verifyReplyOwner(mockReplyId, mockUserId))
        .resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('deleteReply function', () => {
    it('should soft-delete reply from database', async () => {
      // Arrange
      const mockUserId = 'user-123';
      const mockThreadId = 'thread-123';
      const mockCommentId = 'comment-123';
      const mockReplyId = 'reply-123';
      await UsersTableTestHelper.addUser({ id: mockUserId });
      await ThreadsTableTestHelper.addThread({ id: mockThreadId });
      await CommentsTableTestHelper.addComment({ id: mockCommentId });
      await RepliesTableTestHelper.addReply({
        id: mockReplyId,
        commentId: mockCommentId,
        owner: mockUserId,
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      await replyRepositoryPostgres.deleteReply(mockReplyId);

      // Assert
      const replies = await RepliesTableTestHelper.findRepliesById(mockReplyId);
      expect(replies[0].is_delete).toEqual(true);
    });
  });

  describe('getRepliesByCommentIds function', () => {
    it('should return replies by commentIds', async () => {
      // Arrange
      const mockUserId = 'user-123';
      const mockThreadId = 'thread-123';
      const mockCommentIds = ['comment-123', 'comment-456'];
      await UsersTableTestHelper.addUser({ id: mockUserId });
      await ThreadsTableTestHelper.addThread({ id: mockThreadId });
      await CommentsTableTestHelper.addComment({ id: mockCommentIds[0] });
      await CommentsTableTestHelper.addComment({ id: mockCommentIds[1] });
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        commentId: mockCommentIds[0],
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-456',
        commentId: mockCommentIds[0],
        is_delete: true,
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-789',
        commentId: mockCommentIds[1],
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      const replies = await replyRepositoryPostgres.getRepliesByCommentIds(mockCommentIds);

      // Assert
      expect(replies).toHaveLength(3);
      const [reply1, reply2, reply3] = replies;
      expect(reply1.id).toEqual('reply-123');
      expect(reply1.date).toBeDefined();
      expect(reply1.content).toBeDefined();
      expect(reply1.comment_id).toEqual('comment-123');
      expect(reply1.username).toBeDefined();
      expect(reply1.is_delete).toEqual(false);
      expect(reply2.id).toEqual('reply-456');
      expect(reply2.date).toBeDefined();
      expect(reply2.content).toBeDefined();
      expect(reply2.comment_id).toEqual('comment-123');
      expect(reply2.username).toBeDefined();
      expect(reply2.is_delete).toEqual(true);
      expect(reply3.id).toEqual('reply-789');
      expect(reply3.date).toBeDefined();
      expect(reply3.content).toBeDefined();
      expect(reply3.comment_id).toEqual('comment-456');
      expect(reply3.username).toBeDefined();
      expect(reply3.is_delete).toEqual(false);
    });
  });
});
