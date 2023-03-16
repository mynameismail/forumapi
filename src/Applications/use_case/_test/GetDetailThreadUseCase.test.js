const GetDetailThreadUseCase = require('../GetDetailThreadUseCase');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
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
    const mockComments = [
      {
        id: 'comment-123',
        username: 'developer',
        date: 'now',
        content: 'test comment',
      },
      {
        id: 'comment-456',
        username: 'developer',
        date: 'now',
        content: 'test comment',
      },
    ];
    const mockReplies = [
      {
        id: 'reply-123',
        username: 'developer',
        date: 'now',
        content: 'test reply',
        comment_id: 'comment-123',
      },
      {
        id: 'reply-456',
        username: 'developer',
        date: 'now',
        content: 'test reply',
        comment_id: 'comment-123',
      },
      {
        id: 'reply-789',
        username: 'developer',
        date: 'now',
        content: 'test reply',
        comment_id: 'comment-456',
      },
    ];
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
    const expectedComments = [
      {
        id: 'comment-123',
        username: 'developer',
        date: 'now',
        content: 'test comment',
        replies: [
          {
            id: 'reply-123',
            username: 'developer',
            date: 'now',
            content: 'test reply',
          },
          {
            id: 'reply-456',
            username: 'developer',
            date: 'now',
            content: 'test reply',
          },
        ],
      },
      {
        id: 'comment-456',
        username: 'developer',
        date: 'now',
        content: 'test comment',
        replies: [
          {
            id: 'reply-789',
            username: 'developer',
            date: 'now',
            content: 'test reply',
          },
        ],
      },
    ];
    expect(detailThread).toStrictEqual({
      ...mockDetailThread,
      comments: expectedComments,
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
        },
        {
          id: 'comment-456',
          username: 'developer',
          date: 'now',
          content: 'test comment',
        },
      ];
      const mockReplies = [
        {
          id: 'reply-123',
          username: 'developer',
          date: 'now',
          content: 'test reply',
          comment_id: 'comment-123',
        },
        {
          id: 'reply-456',
          username: 'developer',
          date: 'now',
          content: 'test reply',
          comment_id: 'comment-123',
        },
        {
          id: 'reply-789',
          username: 'developer',
          date: 'now',
          content: 'test reply',
          comment_id: 'comment-456',
        },
      ];
      const getDetailThreadUseCase = new GetDetailThreadUseCase({
        threadRepository: {},
        commentRepository: {},
        replyRepository: {},
      });

      // Action
      const commentsWithReplies = getDetailThreadUseCase._associateRepliesToComments(
        mockComments, mockReplies,
      );

      // Assert
      const expectedComments = [
        {
          id: 'comment-123',
          username: 'developer',
          date: 'now',
          content: 'test comment',
          replies: [
            {
              id: 'reply-123',
              username: 'developer',
              date: 'now',
              content: 'test reply',
            },
            {
              id: 'reply-456',
              username: 'developer',
              date: 'now',
              content: 'test reply',
            },
          ],
        },
        {
          id: 'comment-456',
          username: 'developer',
          date: 'now',
          content: 'test comment',
          replies: [
            {
              id: 'reply-789',
              username: 'developer',
              date: 'now',
              content: 'test reply',
            },
          ],
        },
      ];

      expect(commentsWithReplies).toStrictEqual(expectedComments);
    });
  });
});
