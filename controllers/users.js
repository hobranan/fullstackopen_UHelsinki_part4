const bcrypt = require("bcrypt");
const usersRouter = require("express").Router();
const User = require("../models/user");
const Blog = require("../models/blog");
const logger = require("../utils/logger");

usersRouter.get("/", async (request, response) => {
  const users = await User.find({}).populate("blogs", {
    title: 1,
    url: 1,
    likes: 1,
  });
  response.json(users);
});
// http://localhost:3003/api/users

usersRouter.get("/:id", async (request, response) => {
  const user = await User.findById(request.params.id).populate("blogs", {
    title: 1,
    url: 1,
    likes: 1,
  });
  if (user) {
    response.json(user);
  } else {
    response.status(404).end(); // send 404 if no user found with the specified ID
  }
});
// http://localhost:3003/api/users/66e9eaccfe33e97fbd222000

usersRouter.post("/", async (request, response) => {
  const { username, name, password } = request.body;
  if (!username || username.length < 3) {
    logger.error("Username must be at least 3 characters long");
    return response.status(400).json({
      error: "Username must be at least 3 characters long",
    });
  }
  if (!password || password.length < 3) {
    logger.error("Password must be at least 3 characters long");
    return response.status(400).json({
      error: "Password must be at least 3 characters long",
    });
  }
  const check_user_exists = await User.findOne({ username: username });
  if (check_user_exists) {
    logger.error("username already taken");
    return response.status(400).json({
      error: "username already taken",
    });
  }
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);
  const user = new User({
    username,
    name,
    passwordHash,
  });
  const savedUser = await user.save();
  response.status(201).json(savedUser);
});

usersRouter.put("/:id", async (request, response) => {
  const { username, name, password } = request.body;
  if (!username || username.length < 3) {
    logger.error("Username must be at least 3 characters long");
    return response.status(400).json({
      error: "Username must be at least 3 characters long",
    });
  }
  if (!password || password.length < 3) {
    logger.error("Password must be at least 3 characters long");
    return response.status(400).json({
      error: "Password must be at least 3 characters long",
    });
  }
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);
  const user_obj = {
    username: username,
    name: name,
    passwordHash: passwordHash,
  };
  const updatedUser = await User.findByIdAndUpdate(
    request.params.id,
    user_obj,
    {
      new: true,
      runValidators: true,
      context: "query",
    }
  );
  if (updatedUser) {
    response.json(updatedUser);
  } else {
    response.status(404).end();
  }
});

usersRouter.delete("/:id", async (request, response) => {
  const user = await User.findById(request.params.id);
  if (user) {
    await Blog.deleteMany({ user_id: user._id }); // delete all blogs associated with the user
    await User.findByIdAndDelete(request.params.id);
    response.status(204).end();
  } else {
    response.status(404).end();
  }
});

module.exports = usersRouter;
