const { dbPool } = require("../database/db_connection");

const userModel = {
  addNewUser: async function (username, hashedPw) {
    await dbPool.query(
      "INSERT INTO users (username, password_hash, created_at) VALUES ($1,$2, CURRENT_TIMESTAMP)",
      [username, hashedPw],
    );
  },

  getUser: async function (username) {
    const result = await dbPool.query(
      `select users.user_id, username, array_agg(distinct review_id) reviews_ids,
      array_agg(distinct favorite_id) favorite_ids, array_agg(distinct groups.group_id) group_ids
      from users
      left join reviews on users.user_id = reviews.user_id
      left join favorites on users.user_id = favorites.user_id
      left join group_members on users.user_id = group_members.user_id
      left join groups on group_members.group_id = groups.group_id where username = $1 group by users.user_id, groups.group_id;`,
      [username],
    );

    return result.rowCount > 0 ? result.rows[0] : null;
  },

  deleteUser: async function (username) {
    await dbPool.query("DELETE FROM users WHERE username=$1", [username]);
  },

  getHashedPassword: async function (username) {
    const result = await dbPool.query(
      "SELECT user_id, password_hash FROM users WHERE username=$1",
      [username],
    );

    return result.rowCount > 0 ? result.rows[0] : null;
  },

  addFavorite: async function (username, tmdbId) {
    await dbPool.query(
      "INSERT INTO favorites (user_id,media_id) VALUES ((SELECT user_id FROM users WHERE username=$1),(SELECT media_id FROM media WHERE tmdb_id=$2))",
      [username, tmdbId],
    );
  },

  deleteFavorite: async function (username, tmdbId) {
    await dbPool.query(
      `DELETE FROM favorites
      WHERE user_id IN (SELECT user_id FROM users WHERE username = $1)
      AND media_id IN (SELECT media_id FROM media WHERE tmdb_id = $2)`,
      [username, tmdbId],
    );
  },

  deleteFavoritesByUserId: async function (user_id) {
    await dbPool.query(`DELETE FROM favorites WHERE user_id = $1`, [user_id]);
  },

  getFavorites: async function (username) {
    const result = await dbPool.query(
      "SELECT media.* FROM media JOIN favorites USING (media_id) JOIN users USING (user_id) WHERE users.username=$1",
      [username],
    );

    return result.rowCount > 0 ? result.rows : null;
  },
  getFavoritesByListId: async function (listId) {
    const result = await dbPool.query(
      `SELECT media.*, users.username AS shared_by
       FROM media
       JOIN favorites USING (media_id)
       JOIN users USING (user_id)
       WHERE favorites.user_id=$1`,
      [listId],
    );
    return result.rowCount > 0 ? result.rows : null;
  },

  getReviews: async function (username) {
    const result = await dbPool.query(
      "SELECT * FROM reviews JOIN users USING (user_id) WHERE users.username=$1",
      [username],
    );
    return result.rowCount > 0 ? result.rows : null;
  },
};

module.exports = userModel;
