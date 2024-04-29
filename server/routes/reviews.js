const router = require("express").Router();
const reviews = require("../models/reviews_model");
const verifyToken = require("../middleware/verify-token");
const mediaModel = require("../models/media_model");

router.get("/", async (_req, res) => {
  try {
    const result = await reviews.getAll();
    res.json(result);
  } catch (err) {
    res.status(500).end();
  }
});

router.get("/user/:username", async (req, res) => {
  try {
    const result = await reviews.getByUsername(req.params.username);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/media/:tmdbId", async (req, res) => {
  try {
    const result = await reviews.getByTmdbId(req.params.tmdbId);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/", verifyToken, async (req, res) => {
  try {
    const { tmdbId, title, type, description, posterUrl, userId, rating, reviewText, released } =
      req.body;

    const rowCount = (await mediaModel.getByTmdbId(tmdbId)).rowCount;

    if (rowCount === 0) {
      await mediaModel.add({
        title,
        type,
        description,
        tmdbId,
        posterUrl,
        released,
      });
    }

    const result = await reviews.add({ userId, tmdbId, rating, reviewText });
    res.status(201).json({
      ...result,
      tmdbId,
    });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

router.put("/", verifyToken, async (req, res) => {
  try {
    const result = await reviews.update(req.body);
    res.status(200).json(result);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const result = await reviews.delete(req.params.id);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
