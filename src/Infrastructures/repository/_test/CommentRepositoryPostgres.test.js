const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const pool = require('../../database/postgres/pool');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist add comment and return added comment correctly', async () => {
      // Arrange
      const mockUserId = 'user-123';
      const mockThreadId = 'thread-123';
      await UsersTableTestHelper.addUser({ id: mockUserId });
      await ThreadsTableTestHelper.addThread({ id: mockThreadId });
      const comment = new AddComment({
        content: 'test comment',
        threadId: mockThreadId,
        owner: mockUserId,
      });
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedComment = await commentRepositoryPostgres.addComment(comment);

      // Assert
      const comments = await CommentsTableTestHelper.findCommentsById('comment-123');
      expect(comments).toHaveLength(1);
      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-123',
        content: 'test comment',
        owner: mockUserId,
      }));
    });
  });

  describe('verifyCommentOwner function', () => {
    it('should throw NotFoundError when comment not found', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      // Action and Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner('comment-123', 'user-123'))
        .rejects.toThrowError(NotFoundError);
    });

    it('should throw AuthorizationError when user is not owner', async () => {
      // Arrange
      const mockUserId = 'user-123';
      const mockThreadId = 'thread-123';
      const mockCommentId = 'comment-123';
      await UsersTableTestHelper.addUser({ id: mockUserId });
      await ThreadsTableTestHelper.addThread({ id: mockThreadId });
      await CommentsTableTestHelper.addComment({
        id: mockCommentId,
        threadId: mockThreadId,
        owner: mockUserId,
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action and Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner(mockCommentId, 'user-456'))
        .rejects.toThrowError(AuthorizationError);
    });

    it('should not throw NotFoundError nor AuthorizationError when comment found and user is owner', async () => {
      // Arrange
      const mockUserId = 'user-123';
      const mockThreadId = 'thread-123';
      const mockCommentId = 'comment-123';
      await UsersTableTestHelper.addUser({ id: mockUserId });
      await ThreadsTableTestHelper.addThread({ id: mockThreadId });
      await CommentsTableTestHelper.addComment({
        id: mockCommentId,
        threadId: mockThreadId,
        owner: mockUserId,
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action and Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner(mockCommentId, mockUserId))
        .resolves.not.toThrowError(NotFoundError);
      await expect(commentRepositoryPostgres.verifyCommentOwner(mockCommentId, mockUserId))
        .resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('deleteComment function', () => {
    it('should soft-delete comment from database', async () => {
      // Arrange
      const mockUserId = 'user-123';
      const mockThreadId = 'thread-123';
      const mockCommentId = 'comment-123';
      await UsersTableTestHelper.addUser({ id: mockUserId });
      await ThreadsTableTestHelper.addThread({ id: mockThreadId });
      await CommentsTableTestHelper.addComment({
        id: mockCommentId,
        threadId: mockThreadId,
        owner: mockUserId,
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      await commentRepositoryPostgres.deleteComment(mockCommentId);

      // Assert
      const comments = await CommentsTableTestHelper.findCommentsById(mockCommentId);
      expect(comments[0].is_delete).toEqual(true);
    });
  });

  describe('getCommentsByThreadId function', () => {
    it('should return comments by threadId', async () => {
      // Arrange
      const mockUserId = 'user-123';
      const mockThreadId = 'thread-123';
      await UsersTableTestHelper.addUser({ id: mockUserId });
      await ThreadsTableTestHelper.addThread({ id: mockThreadId });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        date: 'now1',
        threadId: mockThreadId,
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-456',
        date: 'now2',
        threadId: mockThreadId,
        is_delete: true,
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const comments = await commentRepositoryPostgres.getCommentsByThreadId(mockThreadId);

      // Assert
      expect(comments).toStrictEqual([
        {
          id: 'comment-123',
          date: 'now1',
          content: 'test comment',
          username: 'dicoding',
          is_delete: false,
        },
        {
          id: 'comment-456',
          date: 'now2',
          content: 'test comment',
          username: 'dicoding',
          is_delete: true,
        },
      ]);
    });
  });

  describe('checkIfCommentIdExist function', () => {
    it('should throw NotFoundError when commentId not exist', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      // Action and Assert
      await expect(commentRepositoryPostgres.checkIfCommentIdExist('comment-123'))
        .rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when commentId exist', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      // Action and Assert
      await expect(commentRepositoryPostgres.checkIfCommentIdExist('comment-123'))
        .resolves.not.toThrowError(NotFoundError);
    });
  });
});
