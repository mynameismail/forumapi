const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const pool = require('../../database/postgres/pool');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist add thread and return added thread correctly', async () => {
      // Arrange
      const mockUserId = 'user-123';
      await UsersTableTestHelper.addUser({ id: mockUserId });
      const thread = new AddThread({
        title: 'test thread',
        body: 'test thread body',
        owner: mockUserId,
      });
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(thread);

      // Assert
      const threads = await ThreadsTableTestHelper.findThreadsById('thread-123');
      expect(threads).toHaveLength(1);
      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-123',
        title: 'test thread',
        owner: mockUserId,
      }));
    });
  });

  describe('checkIfThreadIdExist function', () => {
    it('should throw NotFoundError when threadId not exist', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
      // Action and Assert
      await expect(threadRepositoryPostgres.checkIfThreadIdExist('thread-123')).rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when threadId exist', async () => {
      // Arrange
      const mockUserId = 'user-123';
      await UsersTableTestHelper.addUser({ id: mockUserId });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: mockUserId });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
      // Action and Assert
      await expect(threadRepositoryPostgres.checkIfThreadIdExist('thread-123')).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('getDetailThreadById function', () => {
    it('should throw NotFoundError when threadId not exist', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
      // Action and Assert
      await expect(threadRepositoryPostgres.getDetailThreadById('thread-123')).rejects.toThrowError(NotFoundError);
    });

    it('should return a DetailThread correctly', async () => {
      // Arrange
      const mockUserId = 'user-123';
      const mockUsername = 'developer';
      const mockThreadId = 'thread-123';
      await UsersTableTestHelper.addUser({ id: mockUserId, username: mockUsername });
      await ThreadsTableTestHelper.addThread({ id: mockThreadId, owner: mockUserId });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      const detailThread = await threadRepositoryPostgres.getDetailThreadById(mockThreadId);

      // Assert
      expect(detailThread).toBeInstanceOf(DetailThread);
      expect(detailThread.id).toEqual(mockThreadId);
      expect(detailThread.username).toEqual(mockUsername);
    });
  });
});
