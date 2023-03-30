const LikeCommentUseCase = require('../LikeCommentUseCase');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('LikeCommentUseCase', () => {
  it('should orchestrating the like comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: 'user-123',
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    mockThreadRepository.checkIfThreadIdExist = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.checkIfCommentLiked = jest.fn()
      .mockImplementation(() => Promise.resolve(false));
    mockCommentRepository.addCommentLike = jest.fn()
      .mockImplementation(() => Promise.resolve());
    const likeCommentUseCase = new LikeCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await likeCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.checkIfThreadIdExist)
      .toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.checkIfCommentLiked)
      .toBeCalledWith(useCasePayload.commentId, useCasePayload.userId);
    expect(mockCommentRepository.addCommentLike)
      .toBeCalledWith(useCasePayload.commentId, useCasePayload.userId);
  });

  it('should orchestrating the unlike comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: 'user-123',
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    mockThreadRepository.checkIfThreadIdExist = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.checkIfCommentLiked = jest.fn()
      .mockImplementation(() => Promise.resolve(true));
    mockCommentRepository.deleteCommentLike = jest.fn()
      .mockImplementation(() => Promise.resolve());
    const likeCommentUseCase = new LikeCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await likeCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.checkIfThreadIdExist)
      .toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.checkIfCommentLiked)
      .toBeCalledWith(useCasePayload.commentId, useCasePayload.userId);
    expect(mockCommentRepository.deleteCommentLike)
      .toBeCalledWith(useCasePayload.commentId, useCasePayload.userId);
  });
});
