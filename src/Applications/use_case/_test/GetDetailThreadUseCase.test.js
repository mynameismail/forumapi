const GetDetailThreadUseCase = require('../GetDetailThreadUseCase');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const DetailComment = require('../../../Domains/comments/entities/DetailComment');
const DetailReply = require('../../../Domains/replies/entities/DetailReply');

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
    const mockComments = [
      {
        id: 'comment-123',
        username: 'developer',
        date: 'now',
        content: 'test comment',
        is_delete: false,
      },
      {
        id: 'comment-456',
        username: 'developer',
        date: 'now',
        content: 'test comment',
        is_delete: false,
      },
    ];
    const mockReplies = [];
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();
    mockThreadRepository.getDetailThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(mockDetailThread));
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(mockComments));
    mockReplyRepository.getRepliesByCommentIds = jest.fn()
      .mockImplementation(() => Promise.resolve(mockReplies));
    const getDetailThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const detailThread = await getDetailThreadUseCase.execute(mockThreadId);

    // Assert
    const { id, comments } = detailThread;
    expect(detailThread).toBeInstanceOf(DetailThread);
    expect(id).toEqual(mockThreadId);
    expect(comments).toHaveLength(2);
    comments.forEach((comment) => {
      expect(comment).toBeInstanceOf(DetailComment);
    });
    expect(mockThreadRepository.getDetailThreadById).toBeCalledWith(mockThreadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(mockThreadId);
    expect(mockReplyRepository.getRepliesByCommentIds).toBeCalledWith(['comment-123', 'comment-456']);
  });

  describe('_associateRepliesToComments function', () => {
    it('should return comments with its replies each', () => {
      // Arrange
      const mockComments = [
        {
          id: 'comment-123',
          username: 'developer',
          date: 'now',
          content: 'test comment',
          is_delete: false,
        },
        {
          id: 'comment-456',
          username: 'developer',
          date: 'now',
          content: 'test comment',
          is_delete: true,
        },
      ];
      const mockReplies = [
        {
          id: 'reply-123',
          username: 'developer',
          date: 'now',
          content: 'test reply',
          comment_id: 'comment-123',
          is_delete: false,
        },
        {
          id: 'reply-456',
          username: 'developer',
          date: 'now',
          content: 'test reply',
          comment_id: 'comment-123',
          is_delete: true,
        },
        {
          id: 'reply-789',
          username: 'developer',
          date: 'now',
          content: 'test reply',
          comment_id: 'comment-456',
          is_delete: false,
        },
      ];
      const getDetailThreadUseCase = new GetDetailThreadUseCase({
        threadRepository: {},
        commentRepository: {},
        replyRepository: {},
      });

      // Action
      const commentsWithReplies = getDetailThreadUseCase
        ._associateRepliesToComments(mockComments, mockReplies);

      // Assert
      commentsWithReplies.forEach((comment) => {
        expect(comment).toBeInstanceOf(DetailComment);
        expect(comment.replies.length).toBeGreaterThan(0);
        comment.replies.forEach((reply) => {
          expect(reply).toBeInstanceOf(DetailReply);
        });
      });
    });
  });
});
