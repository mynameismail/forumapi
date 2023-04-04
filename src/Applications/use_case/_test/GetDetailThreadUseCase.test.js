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
        date: 'now1',
        content: 'test comment',
        is_delete: false,
      },
      {
        id: 'comment-456',
        username: 'developer',
        date: 'now2',
        content: 'test comment',
        is_delete: true,
      },
      {
        id: 'comment-789',
        username: 'developer',
        date: 'now3',
        content: 'test comment',
        is_delete: false,
      },
    ];
    const mockReplies = [
      {
        id: 'reply-123',
        username: 'developer',
        date: 'now1',
        content: 'test reply',
        comment_id: 'comment-123',
        is_delete: false,
      },
      {
        id: 'reply-456',
        username: 'developer',
        date: 'now2',
        content: 'test reply',
        comment_id: 'comment-123',
        is_delete: true,
      },
      {
        id: 'reply-789',
        username: 'developer',
        date: 'now3',
        content: 'test reply',
        comment_id: 'comment-456',
        is_delete: false,
      },
    ];
    const mockLikeCounts = [
      {
        comment_id: 'comment-123',
        like_count: '1',
      },
      {
        comment_id: 'comment-456',
        like_count: '2',
      },
    ];
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();
    mockThreadRepository.getDetailThreadById = jest.fn(() => Promise.resolve(mockDetailThread));
    mockCommentRepository.getCommentsByThreadId = jest.fn(() => Promise.resolve(mockComments));
    mockCommentRepository.getLikeCountsByCommentIds = jest
      .fn(() => Promise.resolve(mockLikeCounts));
    mockReplyRepository.getRepliesByCommentIds = jest.fn(() => Promise.resolve(mockReplies));
    const getDetailThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const detailThread = await getDetailThreadUseCase.execute(mockThreadId);

    // Assert
    expect(detailThread).toStrictEqual(new DetailThread({
      id: 'thread-123',
      title: 'test thread',
      body: 'test thread body',
      date: 'now',
      username: 'developer',
      comments: [
        new DetailComment({
          id: 'comment-123',
          username: 'developer',
          date: 'now1',
          content: 'test comment',
          is_delete: false,
          likeCount: 1,
          replies: [
            new DetailReply({
              id: 'reply-123',
              username: 'developer',
              date: 'now1',
              content: 'test reply',
              comment_id: 'comment-123',
              is_delete: false,
            }),
            new DetailReply({
              id: 'reply-456',
              username: 'developer',
              date: 'now2',
              content: '**balasan telah dihapus**',
              comment_id: 'comment-123',
              is_delete: true,
            }),
          ],
        }),
        new DetailComment({
          id: 'comment-456',
          username: 'developer',
          date: 'now2',
          content: '**komentar telah dihapus**',
          is_delete: true,
          likeCount: 2,
          replies: [
            new DetailReply({
              id: 'reply-789',
              username: 'developer',
              date: 'now3',
              content: 'test reply',
              comment_id: 'comment-456',
              is_delete: false,
            }),
          ],
        }),
        new DetailComment({
          id: 'comment-789',
          username: 'developer',
          date: 'now3',
          content: 'test comment',
          is_delete: false,
          likeCount: 0,
          replies: [],
        }),
      ],
    }));

    expect(mockThreadRepository.getDetailThreadById).toBeCalledWith(mockThreadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(mockThreadId);
    expect(mockCommentRepository.getLikeCountsByCommentIds)
      .toBeCalledWith(['comment-123', 'comment-456', 'comment-789']);
    expect(mockReplyRepository.getRepliesByCommentIds)
      .toBeCalledWith(['comment-123', 'comment-456', 'comment-789']);
  });
});
