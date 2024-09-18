const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const loginRouter = require("express").Router();
const User = require("../models/user");
const logger = require("../utils/logger");

loginRouter.post("/", async (request, response) => {
  const { username, password } = request.body;
  const user = await User.findOne({ username });
  const passwordCorrect =
    user === null ? false : await bcrypt.compare(password, user.passwordHash);
  if (!(user && passwordCorrect)) {
    logger.error("invalid username or password");
    return response.status(401).json({
      error: "invalid username or password",
    });
  }
  const userForToken = {
    username: user.username,
    id: user._id, // or should this be user.id || user._id.toString()
  };
  const token = jwt.sign(userForToken, process.env.SECRET, {
    expiresIn: 60 * 60, // token expires in 60 minutes
  });
  response
    .status(200)
    .send({ token, username: user.username, name: user.name });
});

module.exports = loginRouter;
