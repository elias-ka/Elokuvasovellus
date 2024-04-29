const helmet = require("helmet");
const express = require("express");
const cors = require("cors");
const app = express();

const users = require("../routes/users");
const reviews = require("../routes/reviews");
const groups = require("../routes/groups");
const search = require("../routes/tmdb");

app.use(helmet());
app.use(express.json());
app.use(cors());

app.use("/users", users);
app.use("/reviews", reviews);
app.use("/groups", groups);
app.use("/search", search);

app.listen(process.env.SERVER_PORT, () => {
  console.log(`Server running on port ${process.env.SERVER_PORT}`);
});

// Catch any unhandled errors
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).end();
});

module.exports = app;
