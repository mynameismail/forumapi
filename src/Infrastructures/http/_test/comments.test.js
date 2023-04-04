const Jwt = require('@hapi/jwt');
const JwtTokenManager = require('../../security/JwtTokenManager');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');
const pool = require('../../database/postgres/pool');

describe('comments endpoint', () => {
  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });

  const mockUserId = 'user-123';
  const mockThreadId = 'thread-123';
  const jwtTokenManager = new JwtTokenManager(Jwt.token);

  beforeAll(async () => {
    await UsersTableTestHelper.addUser({ id: mockUserId });
  });

  describe('when POST /threads/{threadId}/comments', () => {
    const requestMethod = 'POST';
    const requestUrl = `/threads/${mockThreadId}/comments`;

    it('should response 201 and persisted comment', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread({ id: mockThreadId });

      const requestPayload = {
        content: 'test comment',
      };
      const server = await createServer(container);

      // Action
      const accessToken = await jwtTokenManager.createAccessToken({ id: mockUserId });
      const response = await server.inject({
        method: requestMethod,
        url: requestUrl,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread({ id: mockThreadId });

      const requestPayload = {};
      const server = await createServer(container);

      // Action
      const accessToken = await jwtTokenManager.createAccessToken({ id: mockUserId });
      const response = await server.inject({
        method: requestMethod,
        url: requestUrl,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat comment baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread({ id: mockThreadId });

      const requestPayload = {
        content: 123,
      };
      const server = await createServer(container);

      // Action
      const accessToken = await jwtTokenManager.createAccessToken({ id: mockUserId });
      const response = await server.inject({
        method: requestMethod,
        url: requestUrl,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat comment baru karena tipe data tidak sesuai');
    });

    it('should response 404 when threadId not exist', async () => {
      // Arrange
      const requestPayload = {
        content: 'test comment',
      };
      const server = await createServer(container);

      // Action
      const accessToken = await jwtTokenManager.createAccessToken({ id: mockUserId });
      const response = await server.inject({
        method: requestMethod,
        url: requestUrl,
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
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    const mockCommentId = 'comment-123';
    const requestMethod = 'DELETE';
    const requestUrl = `/threads/${mockThreadId}/comments/${mockCommentId}`;

    it('should response 200', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread({ id: mockThreadId });
      await CommentsTableTestHelper.addComment({
        id: mockCommentId,
        threadId: mockThreadId,
        owner: mockUserId,
      });

      const server = await createServer(container);

      // Action
      const accessToken = await jwtTokenManager.createAccessToken({ id: mockUserId });
      const response = await server.inject({
        method: requestMethod,
        url: requestUrl,
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
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: requestMethod,
        url: requestUrl,
      });

      // Assert
      expect(response.statusCode).toEqual(401);
    });

    it('should response 404 when threadId not exist', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const accessToken = await jwtTokenManager.createAccessToken({ id: mockUserId });
      const response = await server.inject({
        method: requestMethod,
        url: requestUrl,
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
      await ThreadsTableTestHelper.addThread({ id: mockThreadId });

      const server = await createServer(container);

      // Action
      const accessToken = await jwtTokenManager.createAccessToken({ id: mockUserId });
      const response = await server.inject({
        method: requestMethod,
        url: requestUrl,
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

  describe('when PUT /threads/{threadId}/comments/{commentId}/likes', () => {
    const mockCommentId = 'comment-123';
    const requestMethod = 'PUT';
    const requestUrl = `/threads/${mockThreadId}/comments/${mockCommentId}/likes`;

    it('should response 200', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread({ id: mockThreadId });
      await CommentsTableTestHelper.addComment({
        id: mockCommentId,
        threadId: mockThreadId,
        owner: mockUserId,
      });

      const server = await createServer(container);

      // Action
      const accessToken = await jwtTokenManager.createAccessToken({ id: mockUserId });
      const response = await server.inject({
        method: requestMethod,
        url: requestUrl,
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
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: requestMethod,
        url: requestUrl,
      });

      // Assert
      expect(response.statusCode).toEqual(401);
    });

    it('should response 404 when threadId not exist', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const accessToken = await jwtTokenManager.createAccessToken({ id: mockUserId });
      const response = await server.inject({
        method: requestMethod,
        url: requestUrl,
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
      await ThreadsTableTestHelper.addThread({ id: mockThreadId });

      const server = await createServer(container);

      // Action
      const accessToken = await jwtTokenManager.createAccessToken({ id: mockUserId });
      const response = await server.inject({
        method: requestMethod,
        url: requestUrl,
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
});
