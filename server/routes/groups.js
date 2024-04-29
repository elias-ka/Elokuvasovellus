const router = require("express").Router();
const groups = require("../models/groups_model");
const groupContents = require("../models/group_contents_model");
const media = require("../models/media_model");
const showtimes = require("../models/showtimes_model");
const groupMembers = require("../models/group_members_model");
const verifyToken = require("../middleware/verify-token");

// Get all groups with their information
router.get("/", async (req, res) => {
  try {
    const result = await groups.getAll();
    res.json(result);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Add a group. Also adds the user who created the group as a accepted member of the group.
router.post("/", verifyToken, async (req, res) => {
  try {
    const result = await groups.add(req.body);
    res.status(201).json(result);
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: "Bad request" });
  }
});

// Delete a group. First deletes the group members from the group_members table
// and the group contents from the group_contents table.
router.delete("/:groupId", verifyToken, async (req, res) => {
  const groupId = req.params.groupId;
  try {
    await groupMembers.deleteAllGroupMembers(groupId);
    await groupContents.deleteAllGroupContent(groupId);
    const result = await groups.deleteGroup(groupId);

    if (result.length === 0) {
      return res.status(404).json({ error: "Group not found" });
    }
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get all media and showtimes for a group.
router.get("/:groupId/contents", verifyToken, async (req, res) => {
  const groupId = req.params.groupId;
  try {
    const result = await groupContents.getGroupContents(groupId);
    res.json(result);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get all media for a group.
router.get("/:groupId/contents/media", verifyToken, async (req, res) => {
  const groupId = req.params.groupId;
  try {
    const result = await groupContents.getGroupMedia(groupId);
    res.json(result);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// get all showtimes for a group
router.get("/:groupId/contents/showtime", verifyToken, async (req, res) => {
  const groupId = req.params.groupId;
  try {
    const result = await groupContents.getGroupShowtime(groupId);
    res.json(result);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Add media to group
router.post("/:groupId/contents/media", async (req, res) => {
  const groupId = req.params.groupId;
  const { tmdbId, addedBy } = req.body;
  try {
    if (tmdbId) {
      const result = await media.getByTmdbId(tmdbId);
      const rows = result.rowCount;
      if (rows === 0) {
        const mediaObject = {
          title: req.body.title,
          type: req.body.type,
          description: req.body.description,
          tmdbId: req.body.tmdbId,
          posterUrl: req.body.posterUrl,
        };
        await media.add(mediaObject);
      }
    }
    await groupContents.addMediaToGroup({
      groupId,
      tmdbId,
      addedBy,
    });
    res.status(201).end();
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Add showtime to group
router.post("/:groupId/contents/showtime", async (req, res) => {
  const groupId = req.params.groupId;
  const { addedBy, ID, showtimeObjectRaw } = req.body;
  const showtimeObj = JSON.stringify(showtimeObjectRaw);

  try {
    const result = await showtimes.getById(ID);
    const rows = result.rowCount;
    if (rows === 0) {
      await showtimes.add({ ID, showtimeObj });
    }
    await groupContents.addShowtimeToGroup({
      groupId,
      ID,
      addedBy,
    });
    res.status(201).end();
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete content by content_id
router.delete("/contents/:contentId", verifyToken, async (req, res) => {
  const contentId = req.params.contentId;
  try {
    const result = await groupContents.deleteGroupContentById(contentId);
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get group members
router.get("/:groupId/members", verifyToken, async (req, res) => {
  const groupId = req.params.groupId;
  try {
    const result = await groupMembers.getAllByGroupId(groupId);
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Add a member to the group (join request, accepted=false unless specified otherwise)
router.post("/:groupId/members", verifyToken, async (req, res) => {
  const { userId, accepted } = req.body;
  const groupId = req.params.groupId;
  try {
    const result = await groupMembers.add({
      groupId,
      userId,
      accepted, // Can be undefined, in which case it is set to false
    });
    res.status(201).json(result);
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: "Bad request" });
  }
});

// Get all groups a user is a member of. Shows the group_id and accepted status.
router.get("/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    const result = await groupMembers.getGroupsByUserId(userId);
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete a member from group
router.delete("/:groupId/members/:userId", verifyToken, async (req, res) => {
  const { groupId, userId } = req.params;
  try {
    const result = await groupMembers.deleteGroupMember(groupId, userId);
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Accept a member into the group. Sets the accepted value to true.
router.put("/:groupId/members", verifyToken, async (req, res) => {
  const groupId = req.params.groupId;
  const { userId } = req.body;
  try {
    const result = await groupMembers.acceptGroupMember(groupId, userId);
    if (result.length === 0) {
      return res.status(404).json({ error: "Group member not found" });
    }
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
