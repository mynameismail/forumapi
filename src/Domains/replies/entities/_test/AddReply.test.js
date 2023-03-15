const AddReply = require('../AddReply');

describe('an AddReply entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      content: 'abc',
      commentId: 'abc',
    };
    // Action and Assert
    expect(() => new AddReply(payload)).toThrowError('ADD_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      content: 123,
      commentId: true,
      owner: 'abc',
    };
    // Action and Assert
    expect(() => new AddReply(payload)).toThrowError('ADD_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create addReply object correctly', () => {
    // Arrange
    const payload = {
      content: 'abc',
      commentId: 'abc',
      owner: 'abc',
    };
    // Action
    const { content, commentId, owner } = new AddReply(payload);
    // Assert
    expect(content).toEqual(payload.content);
    expect(commentId).toEqual(payload.commentId);
    expect(owner).toEqual(payload.owner);
  });
});
