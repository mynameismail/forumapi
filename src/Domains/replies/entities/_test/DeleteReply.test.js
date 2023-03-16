const DeleteReply = require('../DeleteReply');

describe('a DeleteReply entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      threadId: 'abc',
      commentId: 'abc',
      replyId: 'abc',
    };
    // Action and Assert
    expect(() => new DeleteReply(payload)).toThrowError('DELETE_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      threadId: 123,
      commentId: true,
      replyId: [],
      owner: 'abc',
    };
    // Action and Assert
    expect(() => new DeleteReply(payload)).toThrowError('DELETE_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create deleteReply object correctly', () => {
    // Arrange
    const payload = {
      threadId: 'abc',
      commentId: 'abc',
      replyId: 'abc',
      owner: 'abc',
    };
    // Action
    const {
      threadId, commentId, replyId, owner,
    } = new DeleteReply(payload);
    // Assert
    expect(threadId).toEqual(payload.threadId);
    expect(commentId).toEqual(payload.commentId);
    expect(replyId).toEqual(payload.replyId);
    expect(owner).toEqual(payload.owner);
  });
});
