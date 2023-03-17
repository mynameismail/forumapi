const DetailReply = require('../DetailReply');

describe('a DetailReply entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'abc',
      username: 'abc',
      date: 'abc',
      content: 'abc',
    };
    // Action and Assert
    expect(() => new DetailReply(payload)).toThrowError('DETAIL_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      username: true,
      date: 'abc',
      content: [],
      is_delete: 'abc',
    };
    // Action and Assert
    expect(() => new DetailReply(payload)).toThrowError('DETAIL_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create detailReply object correctly', () => {
    // Arrange
    const payload = {
      id: 'abc',
      username: 'abc',
      date: 'abc',
      content: 'abc',
      is_delete: false,
    };
    // Action
    const {
      id,
      username,
      date,
      content,
    } = new DetailReply(payload);
    // Assert
    expect(id).toEqual(payload.id);
    expect(username).toEqual(payload.username);
    expect(date).toEqual(payload.date);
    expect(content).toEqual(payload.content);
  });

  it('should create deleted detailReply object correctly', () => {
    // Arrange
    const payload = {
      id: 'abc',
      username: 'abc',
      date: 'abc',
      content: 'abc',
      is_delete: true,
    };
    // Action
    const {
      id,
      username,
      date,
      content,
    } = new DetailReply(payload);
    // Assert
    expect(id).toEqual(payload.id);
    expect(username).toEqual(payload.username);
    expect(date).toEqual(payload.date);
    expect(content).toEqual('**balasan telah dihapus**');
  });
});
