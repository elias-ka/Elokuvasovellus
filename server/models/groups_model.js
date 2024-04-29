const { dbPool } = require("../database/db_connection");

const groups = {
  getAll: async () => {
    const result = await dbPool.query(`
    SELECT
        groups.*,
        users.username AS owner_username,
        COALESCE(gm.member_count, 0) AS member_count
      FROM
        groups
      JOIN
        users ON groups.owner_id = users.user_id
      LEFT JOIN
        (SELECT group_id, COUNT(*) AS member_count FROM group_members WHERE accepted = true GROUP BY group_id) AS gm ON groups.group_id = gm.group_id
    `);
    return result.rows;
  },

  add: async (group) => {
    const groupResult = await dbPool.query(
      "INSERT INTO groups (owner_id, group_name, description) VALUES ($1, $2, $3) RETURNING *",
      [group.ownerId, group.groupName, group.description],
    );
    const newGroup = groupResult.rows[0];

    await dbPool.query(
      "INSERT INTO group_members (user_id, group_id, accepted) VALUES ($1, $2, true)",
      [group.ownerId, newGroup.group_id],
    );
    return newGroup;
  },

  deleteGroup: async (groupId) => {
    const result = await dbPool.query("DELETE FROM groups WHERE group_id = $1 RETURNING *", [
      groupId,
    ]);
    return result.rows;
  },

  updateGroupOwner: async (owner_id, group_id) => {
    const result = await dbPool.query("UPDATE groups SET owner_id = $1 WHERE group_id = $2", [
      owner_id,
      group_id,
    ]);
    return result.rows;
  },
};

module.exports = groups;
