const AddedReply = require('../AddedReply');

describe('an AddedReply entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'abc',
      content: 'abc',
    };
    // Action and Assert
    expect(() => new AddedReply(payload)).toThrowError('ADDED_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      content: true,
      owner: 'abc',
    };
    // Action and Assert
    expect(() => new AddedReply(payload)).toThrowError('ADDED_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create addedReply object correctly', () => {
    // Arrange
    const payload = {
      id: 'abc',
      content: 'abc',
      owner: 'abc',
    };
    // Action
    const { id, content, owner } = new AddedReply(payload);
    // Assert
    expect(id).toEqual(payload.id);
    expect(content).toEqual(payload.content);
    expect(owner).toEqual(payload.owner);
  });
});
