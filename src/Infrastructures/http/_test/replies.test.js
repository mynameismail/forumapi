const Jwt = require('@hapi/jwt');
const JwtTokenManager = require('../../security/JwtTokenManager');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');
const pool = require('../../database/postgres/pool');

describe('replies endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 201 and persisted reply', async () => {
      // Arrange
      const mockUserId = 'user-123';
      const mockThreadId = 'thread-123';
      const mockCommentId = 'comment-123';
      await UsersTableTestHelper.addUser({ id: mockUserId });
      await ThreadsTableTestHelper.addThread({ id: mockThreadId });
      await CommentsTableTestHelper.addComment({ id: mockCommentId });

      const requestPayload = {
        content: 'test reply',
      };
      const server = await createServer(container);

      // Action
      const jwtTokenManager = new JwtTokenManager(Jwt.token);
      const accessToken = await jwtTokenManager.createAccessToken({ id: mockUserId });
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${mockThreadId}/comments/${mockCommentId}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply).toBeDefined();
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const mockUserId = 'user-123';
      const mockThreadId = 'thread-123';
      const mockCommentId = 'comment-123';
      await UsersTableTestHelper.addUser({ id: mockUserId });
      await ThreadsTableTestHelper.addThread({ id: mockThreadId });
      await CommentsTableTestHelper.addComment({ id: mockCommentId });

      const requestPayload = {};
      const server = await createServer(container);

      // Action
      const jwtTokenManager = new JwtTokenManager(Jwt.token);
      const accessToken = await jwtTokenManager.createAccessToken({ id: mockUserId });
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${mockThreadId}/comments/${mockCommentId}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat reply baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const mockUserId = 'user-123';
      const mockThreadId = 'thread-123';
      const mockCommentId = 'comment-123';
      await UsersTableTestHelper.addUser({ id: mockUserId });
      await ThreadsTableTestHelper.addThread({ id: mockThreadId });
      await CommentsTableTestHelper.addComment({ id: mockCommentId });

      const requestPayload = {
        content: 123,
      };
      const server = await createServer(container);

      // Action
      const jwtTokenManager = new JwtTokenManager(Jwt.token);
      const accessToken = await jwtTokenManager.createAccessToken({ id: mockUserId });
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${mockThreadId}/comments/${mockCommentId}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat reply baru karena tipe data tidak sesuai');
    });

    it('should response 404 when threadId not exist', async () => {
      // Arrange
      const mockUserId = 'user-123';
      const mockThreadId = 'thread-123';
      const mockCommentId = 'comment-123';
      await UsersTableTestHelper.addUser({ id: mockUserId });

      const requestPayload = {
        content: 'test reply',
      };
      const server = await createServer(container);

      // Action
      const jwtTokenManager = new JwtTokenManager(Jwt.token);
      const accessToken = await jwtTokenManager.createAccessToken({ id: mockUserId });
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${mockThreadId}/comments/${mockCommentId}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });

    it('should response 404 when commentId not exist', async () => {
      // Arrange
      const mockUserId = 'user-123';
      const mockThreadId = 'thread-123';
      const mockCommentId = 'comment-123';
      await UsersTableTestHelper.addUser({ id: mockUserId });
      await ThreadsTableTestHelper.addThread({ id: mockThreadId });

      const requestPayload = {
        content: 'test reply',
      };
      const server = await createServer(container);

      // Action
      const jwtTokenManager = new JwtTokenManager(Jwt.token);
      const accessToken = await jwtTokenManager.createAccessToken({ id: mockUserId });
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${mockThreadId}/comments/${mockCommentId}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('comment tidak ditemukan');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('should response 200', async () => {
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

      const server = await createServer(container);

      // Action
      const jwtTokenManager = new JwtTokenManager(Jwt.token);
      const accessToken = await jwtTokenManager.createAccessToken({ id: mockUserId });
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${mockThreadId}/comments/${mockCommentId}/replies/${mockReplyId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 401 when authorization is not provided', async () => {
      // Arrange
      const mockThreadId = 'thread-123';
      const mockCommentId = 'comment-123';
      const mockReplyId = 'reply-123';
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${mockThreadId}/comments/${mockCommentId}/replies/${mockReplyId}`,
      });

      // Assert
      expect(response.statusCode).toEqual(401);
    });

    it('should response 404 when threadId not exist', async () => {
      // Arrange
      const mockUserId = 'user-123';
      const mockThreadId = 'thread-123';
      const mockCommentId = 'comment-123';
      const mockReplyId = 'reply-123';
      await UsersTableTestHelper.addUser({ id: mockUserId });

      const server = await createServer(container);

      // Action
      const jwtTokenManager = new JwtTokenManager(Jwt.token);
      const accessToken = await jwtTokenManager.createAccessToken({ id: mockUserId });
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${mockThreadId}/comments/${mockCommentId}/replies/${mockReplyId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });

    it('should response 404 when commentId not exist', async () => {
      // Arrange
      const mockUserId = 'user-123';
      const mockThreadId = 'thread-123';
      const mockCommentId = 'comment-123';
      const mockReplyId = 'reply-123';
      await UsersTableTestHelper.addUser({ id: mockUserId });
      await ThreadsTableTestHelper.addThread({ id: mockThreadId });

      const server = await createServer(container);

      // Action
      const jwtTokenManager = new JwtTokenManager(Jwt.token);
      const accessToken = await jwtTokenManager.createAccessToken({ id: mockUserId });
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${mockThreadId}/comments/${mockCommentId}/replies/${mockReplyId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('comment tidak ditemukan');
    });

    it('should response 404 when replyId not exist', async () => {
      // Arrange
      const mockUserId = 'user-123';
      const mockThreadId = 'thread-123';
      const mockCommentId = 'comment-123';
      const mockReplyId = 'reply-123';
      await UsersTableTestHelper.addUser({ id: mockUserId });
      await ThreadsTableTestHelper.addThread({ id: mockThreadId });
      await CommentsTableTestHelper.addComment({ id: mockCommentId });

      const server = await createServer(container);

      // Action
      const jwtTokenManager = new JwtTokenManager(Jwt.token);
      const accessToken = await jwtTokenManager.createAccessToken({ id: mockUserId });
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${mockThreadId}/comments/${mockCommentId}/replies/${mockReplyId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('reply tidak ditemukan');
    });
  });
});
