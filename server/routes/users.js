require("dotenv").config();
const router = require("express").Router();
const usersModel = require("../models/users_model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/users_model");
const mediaModel = require("../models/media_model");
const reviewModel = require("../models/reviews_model");
const verifyToken = require("../middleware/verify-token");
const { dbPool } = require("../database/db_connection");
const showtimes = require("../models/showtimes_model");
const groupContentsModel = require("../models/group_contents_model");
const groupMembersModel = require("../models/group_members_model");
const groupsModel = require("../models/groups_model");

router.post("/", async (req, res) => {
  try {
    const { username, password, confirmPw } = req.body;

    if (!username || !password || !confirmPw) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // 8 is recommended by OWASP, 72 is the max bcrypt can handle
    // https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
    if (typeof password !== "string" || password.length < 8 || password.length > 72) {
      return res.status(400).json({ message: "Password must be between 8 and 72 characters" });
    }

    if (password !== confirmPw) {
      return res.status(400).json({ message: "Confirmation password does not match" });
    }

    const hashPw = await bcrypt.hash(password, 10);

    try {
      await usersModel.addNewUser(username, hashPw);
      res.status(201).end();
    } catch (err) {
      if (err.message.includes("duplicate")) {
        return res.status(409).json({ message: "Username already exists" });
      }
      return res.status(500).end();
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).end();
  }
});

router.get("/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const user = await usersModel.getUser(username);
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).end();
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).end();
  }
});

router.post("/session", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const row = await usersModel.getHashedPassword(username);
    if (!row) {
      return res.status(401).json({ message: "Incorrect username or password" });
    }

    const isAuthorized = await bcrypt.compare(password, row.password_hash);
    if (!isAuthorized) {
      return res.status(401).json({ message: "Incorrect username or password" });
    }

    const token = jwt.sign({ username }, process.env.JWT_SUPERSECRETSIGNER, {
      issuer: "cinecircle-server",
      audience: "cinecircle",
      expiresIn: "1d",
    });

    res.status(200).json({
      username,
      userId: row.user_id,
      jwtToken: token,
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).end();
  }
});

router.delete("/", verifyToken, async (req, res) => {
  try {
    const { password } = req.body;
    const { username } = res.locals;

    if (!password) {
      return res.status(400).json({ message: "Missing password" });
    }

    const row = await usersModel.getHashedPassword(username);
    if (!row) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const isAuthorized = await bcrypt.compare(password, row.password_hash);
    if (!isAuthorized) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    // DATA DELETION
    try {
      // Transaktio, jotta voidaan peruuttaa kaikki jos jokin menee pieleen
      await dbPool.query("BEGIN");

      const query = await dbPool.query(`SELECT user_id FROM users WHERE username=$1`, [username]);
      const userId = query.rows[0].user_id;

      // Nämä voi suoraan poistaa, koska ei ole riippuvuuksia muihin tauluihin
      await reviewModel.deleteByUserId(userId);
      await usersModel.deleteFavoritesByUserId(userId);
      await groupContentsModel.deleteGroupContentByUserId(userId);

      // Haetaan listalle ryhmät, joissa käyttäjä on omistajana
      const groups = await groupsModel.getAll();
      const groupsWherUserIsOwner = groups.filter((group) => group.owner_id === userId);

      if (groupsWherUserIsOwner) {
        for (const group of groupsWherUserIsOwner) {
          // Jos ryhmässä on muita jäseniä, tarkista hyväksytyt ja siirrä omistajuus
          if (Number(group.member_count) > 1) {
            const groupMembers = await groupMembersModel.getAllByGroupId(group.group_id);
            const acceptedMembers = groupMembers.filter((member) => member.accepted === true);
            // Siirrä omistajuus -- 'ensimmäinen' listalla saa omistajuuden
            await groupsModel.updateGroupOwner(acceptedMembers[1].user_id, group.group_id);
            // Poista käyttäjä ryhmästä
            await groupMembersModel.deleteGroupMember(group.group_id, userId);
          }

          // Jos vain omistaja ryhmässä, poista ei-hyväksytyt jäsenet, omistaja ja viimeisenä ryhmä
          else {
            const groupMembers = await groupMembersModel.getAllByGroupId(group.group_id);
            const notMembers = groupMembers.filter((member) => member.accepted === false);
            if (notMembers) {
              for (const member of notMembers) {
                await groupMembersModel.deleteGroupMember(group.group_id, member.user_id);
              }
            }
            // Poista omistaja viimeisenä ja ryhmä sen jälkeen
            await groupMembersModel.deleteGroupMember(group.group_id, userId);
            await groupsModel.deleteGroup(group.group_id);
          }
        }
      }

      // Poistetaan käyttäjä ryhmistä, joissa ei omistajana
      const userGroupsGuest = await groupMembersModel.getGroupsByUserId(userId);
      if (userGroupsGuest) {
        for (const group of userGroupsGuest) {
          await groupMembersModel.deleteGroupMember(group.group_id, userId);
        }
      }

      await usersModel.deleteUser(username);

      await dbPool.query("COMMIT"); // Jos tänne pääsee niin kaikki ok => commit
      res.status(200).end();
    } catch (err) {
      await dbPool.query("ROLLBACK");
      console.log(err.message);
      res.status(500).end();
    }
  } catch (err) {
    console.log(err.message);
    res.status(500).end();
  }
});

router.post("/:username/favorites", verifyToken, async (req, res) => {
  try {
    const result = await mediaModel.getByTmdbId(req.body.tmdbId);
    const rows = result.rowCount;

    if (rows === 0) {
      const mediaObject = {
        title: req.body.title,
        type: req.body.type,
        description: req.body.description,
        tmdbId: req.body.tmdbId,
        posterUrl: req.body.posterUrl,
      };
      await mediaModel.add(mediaObject);
    }

    await usersModel.addFavorite(req.body.username, req.body.tmdbId);

    res.status(200).end();
  } catch (err) {
    console.error(err.message);
    res.status(500).end();
  }
});

router.delete("/:username/favorites", verifyToken, async (req, res) => {
  try {
    const { tmdbId } = req.body;
    const { username } = res.locals;
    await usersModel.deleteFavorite(username, tmdbId);
    res.status(200).end();
  } catch (err) {
    console.log(err);
    res.status(500).end();
  }
});

router.get("/:username/favorites", async (req, res) => {
  try {
    const { username } = req.params;
    const result = await userModel.getFavorites(username);
    res.status(200).json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).end();
  }
});

router.get("/favorites/:listId", async (req, res) => {
  try {
    const { listId } = req.params;
    const result = await userModel.getFavoritesByListId(listId);
    res.status(200).json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).end();
  }
});

router.get("/:username/reviews", async (req, res) => {
  try {
    const { username } = req.params;
    const result = await userModel.getReviews(username);
    res.status(200).json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).end();
  }
});

module.exports = router;
