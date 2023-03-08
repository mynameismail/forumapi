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
    await pool.end();
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 201 and persisted comment', async () => {
      // Arrange
      const mockUserId = 'user-123';
      const mockThreadId = 'thread-123';
      await UsersTableTestHelper.addUser({ id: mockUserId });
      await ThreadsTableTestHelper.addThread({ id: mockThreadId });

      const requestPayload = {
        content: 'test comment',
      };
      const server = await createServer(container);

      // Action
      const jwtTokenManager = new JwtTokenManager(Jwt.token);
      const accessToken = await jwtTokenManager.createAccessToken({ id: mockUserId });
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${mockThreadId}/comments`,
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
      const mockUserId = 'user-123';
      const mockThreadId = 'thread-123';
      await UsersTableTestHelper.addUser({ id: mockUserId });
      await ThreadsTableTestHelper.addThread({ id: mockThreadId });

      const requestPayload = {};
      const server = await createServer(container);

      // Action
      const jwtTokenManager = new JwtTokenManager(Jwt.token);
      const accessToken = await jwtTokenManager.createAccessToken({ id: mockUserId });
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${mockThreadId}/comments`,
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
      const mockUserId = 'user-123';
      const mockThreadId = 'thread-123';
      await UsersTableTestHelper.addUser({ id: mockUserId });
      await ThreadsTableTestHelper.addThread({ id: mockThreadId });

      const requestPayload = {
        content: 123,
      };
      const server = await createServer(container);

      // Action
      const jwtTokenManager = new JwtTokenManager(Jwt.token);
      const accessToken = await jwtTokenManager.createAccessToken({ id: mockUserId });
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${mockThreadId}/comments`,
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
      const mockUserId = 'user-123';
      const mockThreadId = 'thread-123';
      await UsersTableTestHelper.addUser({ id: mockUserId });

      const requestPayload = {
        content: 'test comment',
      };
      const server = await createServer(container);

      // Action
      const jwtTokenManager = new JwtTokenManager(Jwt.token);
      const accessToken = await jwtTokenManager.createAccessToken({ id: mockUserId });
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${mockThreadId}/comments`,
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
});
