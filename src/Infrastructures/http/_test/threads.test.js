const Jwt = require('@hapi/jwt');
const JwtTokenManager = require('../../security/JwtTokenManager');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');
const pool = require('../../database/postgres/pool');

describe('threads endpoint', () => {
  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
  });

  const mockUserId = 'user-123';
  const jwtTokenManager = new JwtTokenManager(Jwt.token);

  beforeAll(async () => {
    await UsersTableTestHelper.addUser({ id: mockUserId });
  });

  describe('when POST /threads', () => {
    const requestMethod = 'POST';
    const requestUrl = '/threads';

    it('should response 201 and persisted thread', async () => {
      // Arrange
      const requestPayload = {
        title: 'test thread',
        body: 'test thread body',
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
      expect(responseJson.data.addedThread).toBeDefined();
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {
        title: 'test thread',
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
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        title: 'test thread',
        body: true,
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
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena tipe data tidak sesuai');
    });

    it('should response 401 when authorization is not provided', async () => {
      // Arrange
      const requestPayload = {
        title: 'test thread',
        body: 'test thread body',
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: requestMethod,
        url: requestUrl,
        payload: requestPayload,
      });

      // Assert
      expect(response.statusCode).toEqual(401);
    });
  });

  describe('when GET /threads/{threadId}', () => {
    const mockThreadId = 'thread-123';
    const requestMethod = 'GET';
    const requestUrl = `/threads/${mockThreadId}`;

    it('should response 200 and return detail thread', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread({ id: mockThreadId, owner: mockUserId });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: mockThreadId });
      await CommentsTableTestHelper.addComment({ id: 'comment-456', threadId: mockThreadId });
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: requestMethod,
        url: requestUrl,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.comments).toBeDefined();
    });

    it('should response 404 when threadId not exist', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: requestMethod,
        url: requestUrl,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });
  });
});
