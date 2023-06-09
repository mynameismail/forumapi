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
    await CommentsTableTestHelper.cleanTableCommentLike();
    await CommentsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  const mockUserId = 'user-123';
  const mockThreadId = 'thread-123';

  beforeAll(async () => {
    await UsersTableTestHelper.addUser({ id: mockUserId });
    await ThreadsTableTestHelper.addThread({ id: mockThreadId });
  });

  describe('addComment function', () => {
    it('should persist add comment and return added comment correctly', async () => {
      // Arrange
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
      const mockCommentId = 'comment-123';
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
      const mockCommentId = 'comment-123';
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
      const mockCommentId = 'comment-123';
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
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      // Action and Assert
      await expect(commentRepositoryPostgres.checkIfCommentIdExist('comment-123'))
        .resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('checkIfCommentLiked function', () => {
    it('should return false when unliked', async () => {
      // Arrange
      const mockCommentId = 'comment-123';
      await CommentsTableTestHelper.addComment({ id: mockCommentId });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const liked = await commentRepositoryPostgres.checkIfCommentLiked(mockCommentId, mockUserId);

      // Assert
      expect(liked).toEqual(false);
    });

    it('should return true when liked', async () => {
      // Arrange
      const mockCommentId = 'comment-123';
      await CommentsTableTestHelper.addComment({ id: mockCommentId });
      await CommentsTableTestHelper.likeComment({
        commentId: mockCommentId,
        userId: mockUserId,
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const liked = await commentRepositoryPostgres.checkIfCommentLiked(mockCommentId, mockUserId);

      // Assert
      expect(liked).toEqual(true);
    });
  });

  describe('addCommentLike function', () => {
    it('should persist add comment like', async () => {
      // Arrange
      const mockCommentId = 'comment-123';
      await CommentsTableTestHelper.addComment({ id: mockCommentId });
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await commentRepositoryPostgres.addCommentLike(mockCommentId, mockUserId);

      // Assert
      const likes = await CommentsTableTestHelper.findCommentLikes('comment-123', 'user-123');
      expect(likes).toHaveLength(1);
    });
  });

  describe('deleteCommentLike function', () => {
    it('should delete comment like', async () => {
      // Arrange
      const mockCommentId = 'comment-123';
      await CommentsTableTestHelper.addComment({ id: mockCommentId });
      await CommentsTableTestHelper.likeComment({
        commentId: mockCommentId,
        userId: mockUserId,
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      await commentRepositoryPostgres.deleteCommentLike(mockCommentId, mockUserId);

      // Assert
      const likes = await CommentsTableTestHelper.findCommentLikes('comment-123', 'user-123');
      expect(likes).toHaveLength(0);
    });
  });

  describe('getLikeCountsByCommentIds function', () => {
    it('should return like counts by commentIds', async () => {
      // Arrange
      const mockCommentIds = ['comment-123', 'comment-456'];
      await UsersTableTestHelper.addUser({ id: 'user-456', username: 'dicoding2' });
      await CommentsTableTestHelper.addComment({ id: mockCommentIds[0] });
      await CommentsTableTestHelper.addComment({ id: mockCommentIds[1] });
      await CommentsTableTestHelper.likeComment({
        id: 'comment-like-123',
        commentId: mockCommentIds[0],
        userId: 'user-123',
      });
      await CommentsTableTestHelper.likeComment({
        id: 'comment-like-456',
        commentId: mockCommentIds[0],
        userId: 'user-456',
      });
      await CommentsTableTestHelper.likeComment({
        id: 'comment-like-789',
        commentId: mockCommentIds[1],
        userId: 'user-456',
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const likeCounts = await commentRepositoryPostgres.getLikeCountsByCommentIds(mockCommentIds);

      // Assert
      expect(likeCounts).toStrictEqual([
        {
          comment_id: 'comment-123',
          like_count: '2',
        },
        {
          comment_id: 'comment-456',
          like_count: '1',
        },
      ]);
    });
  });
});
