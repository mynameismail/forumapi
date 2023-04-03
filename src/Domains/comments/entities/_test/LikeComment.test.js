const LikeComment = require('../LikeComment');

describe('a LikeComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      threadId: 'abc',
      commentId: 'abc',
    };
    // Action and Assert
    expect(() => new LikeComment(payload)).toThrowError('LIKE_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      threadId: 123,
      commentId: true,
      userId: 'abc',
    };
    // Action and Assert
    expect(() => new LikeComment(payload)).toThrowError('LIKE_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create likeComment object correctly', () => {
    // Arrange
    const payload = {
      threadId: 'abc',
      commentId: 'abc',
      userId: 'abc',
    };
    // Action
    const { threadId, commentId, userId } = new LikeComment(payload);
    // Assert
    expect(threadId).toEqual(payload.threadId);
    expect(commentId).toEqual(payload.commentId);
    expect(userId).toEqual(payload.userId);
  });
});
