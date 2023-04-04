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
      likeCount: 'abc',
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
      likeCount: false,
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
      likeCount: 0,
      replies: [],
    };
    // Action
    const {
      id,
      username,
      date,
      content,
      likeCount,
      replies,
    } = new DetailComment(payload);
    // Assert
    expect(id).toEqual(payload.id);
    expect(username).toEqual(payload.username);
    expect(date).toEqual(payload.date);
    expect(content).toEqual(payload.content);
    expect(likeCount).toEqual(payload.likeCount);
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
      likeCount: 0,
      replies: [],
    };
    // Action
    const {
      id,
      username,
      date,
      content,
      likeCount,
      replies,
    } = new DetailComment(payload);
    // Assert
    expect(id).toEqual(payload.id);
    expect(username).toEqual(payload.username);
    expect(date).toEqual(payload.date);
    expect(content).toEqual('**komentar telah dihapus**');
    expect(likeCount).toEqual(payload.likeCount);
    expect(replies).toEqual(payload.replies);
  });
});
