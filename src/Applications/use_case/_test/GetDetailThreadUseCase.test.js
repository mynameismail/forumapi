const GetDetailThreadUseCase = require('../GetDetailThreadUseCase');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('GetDetailThreadUseCase', () => {
  it('should orchestrating the get detail thread action correctly', async () => {
    // Arrange
    const mockThreadId = 'thread-123';
    const mockDetailThread = {
      id: mockThreadId,
      title: 'test thread',
      body: 'test thread body',
      date: 'now',
      username: 'developer',
    };
    const mockComments = [];
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    mockThreadRepository.getDetailThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(mockDetailThread));
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(mockComments));
    const getDetailThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const detailThread = await getDetailThreadUseCase.execute(mockThreadId);

    // Assert
    expect(detailThread).toStrictEqual({
      ...mockDetailThread,
      comments: mockComments,
    });
    expect(mockThreadRepository.getDetailThreadById).toBeCalledWith(mockThreadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(mockThreadId);
  });
});
