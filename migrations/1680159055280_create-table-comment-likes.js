exports.up = (pgm) => {
  pgm.createTable('comment_likes', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    comment_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  });

  pgm.addConstraint('comment_likes', 'unique_comment_id_and_user_id', 'UNIQUE(comment_id, user_id)');
};

exports.down = (pgm) => {
  pgm.dropTable('comment_likes');
};
