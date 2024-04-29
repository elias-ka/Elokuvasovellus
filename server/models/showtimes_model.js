const { dbPool } = require("../database/db_connection");

const showtimes = {
  add: async (showtime) => {
    await dbPool.query("INSERT INTO showtimes (showtime_id, showtime_obj ) VALUES ($1, $2)", [
      showtime.ID,
      showtime.showtimeObj,
    ]);
  },
  getAll: async () => {
    return dbPool.query("SELECT * FROM showtimes");
  },

  getById: async (id) => {
    return dbPool.query("SELECT * FROM showtimes WHERE showtime_id = $1", [id]);
  },

  delete: async (id) => {
    return dbPool.query("DELETE FROM showtimes WHERE showtime_id = $1", [id]);
  },
};

module.exports = showtimes;
