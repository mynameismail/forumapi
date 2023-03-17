const DetailComment = require('../DetailComment');

describe('a DetailComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'abc',
      username: 'abc',
      date: 'abc',
      content: 'abc',
      is_delete: 'abc',
    };
    // Action and Assert
    expect(() => new DetailComment(payload)).toThrowError('DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      username: true,
      date: 'abc',
      content: [],
      is_delete: 'abc',
      replies: 123,
    };
    // Action and Assert
    expect(() => new DetailComment(payload)).toThrowError('DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create detailComment object correctly', () => {
    // Arrange
    const payload = {
      id: 'abc',
      username: 'abc',
      date: 'abc',
      content: 'abc',
      is_delete: false,
      replies: [],
    };
    // Action
    const {
      id,
      username,
      date,
      content,
      replies,
    } = new DetailComment(payload);
    // Assert
    expect(id).toEqual(payload.id);
    expect(username).toEqual(payload.username);
    expect(date).toEqual(payload.date);
    expect(content).toEqual(payload.content);
    expect(replies).toEqual(payload.replies);
  });

  it('should create deleted detailComment object correctly', () => {
    // Arrange
    const payload = {
      id: 'abc',
      username: 'abc',
      date: 'abc',
      content: 'abc',
      is_delete: true,
      replies: [],
    };
    // Action
    const {
      id,
      username,
      date,
      content,
      replies,
    } = new DetailComment(payload);
    // Assert
    expect(id).toEqual(payload.id);
    expect(username).toEqual(payload.username);
    expect(date).toEqual(payload.date);
    expect(content).toEqual('**komentar telah dihapus**');
    expect(replies).toEqual(payload.replies);
  });
});
