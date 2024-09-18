const blogsRouter = require("express").Router();
const Blog = require("../models/blog"); // this is a 'mongoose' model that represents a blog in the phonebook
const User = require("../models/user"); // this is a 'mongoose' model that represents a user in the phonebook
const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");

blogsRouter.get("/", async (request, response) => {
  const result = await Blog.find({}).populate("user_id", {
    username: 1,
    name: 1,
  });
  response.json(result);
});
// http://localhost:3003/api/blogs

blogsRouter.get("/:id", async (request, response) => {
  const item = await Blog.findById(request.params.id).populate("user_id", {
    username: 1,
    name: 1,
  });
  if (item) {
    response.json(item);
  } else {
    response.status(404).end();
  }
});
// http://localhost:3003/api/blogs/66e9db254b4e13675a71329a good example
// http://localhost:3003/api/blogs/66e4d4c87900000000000000 for fail 404 example
// http://localhost:3003/api/blogs/66e4d4c879 for fail 400 example {"error":"malformatted id"}

blogsRouter.post("/", async (request, response) => {
  const { title, author, url, likes, username } = request.body;
  if (!title || !url) {
    logger.error("title and/or url missing");
    return response.status(400).json({
      error: "title and/or url missing",
    });
  } // checks for more bad values like: null, undefined, NaN, empty string, 0, false

  // find a random user to associate with this blog entry (for now)
  // const users = await User.find();
  // const randomUser = users[Math.floor(Math.random() * users.length)];
  // const user = randomUser;

  // associate the blog entry with the given username
  // const check_user_exists = await User.findOne({ username: username });
  // if (!check_user_exists) {
  //   logger.error("Username does not exist");
  //   return response.status(404).json({
  //     error: "Username does not exist",
  //   });
  // }
  // const user = check_user_exists;

  // associate the blog entry with the username who has a token
  // make sure token is valid, the user holding the token is the same as the username on the post
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  // logger.info("decodedToken", decodedToken);
  if (!decodedToken.id) {
    logger.error("token invalid");
    return response.status(401).json({ error: 'token invalid' })
  }
  const token_user = await User.findById(decodedToken.id)
  // logger.info("token_user", token_user);
  if (token_user.username !== username) { // * not sure if this is best way of verifying a post (or even needed at all)
    logger.error("username does not hold auth");
    return response.status(401).json({ error: 'username does not hold auth' })
  }
  const user = token_user;

  const entry = new Blog({
    title: title,
    author: author,
    url: url,
    likes: likes || 0, // if likes is missing, set it to 0
    user_id: user._id || user.id,
  });
  const result = await entry.save();
  user.blogs = user.blogs.concat(result._id || result.id);
  // logger.info("user.blogs", user.blogs);
  await user.save();
  const item = await Blog.findById(result._id || result.id).populate("user_id", {
    username: 1,
    name: 1,
  });
  response.status(201).json(item);
});
// check requests/create***.rest files for testing

blogsRouter.put("/:id", async (request, response) => {
  const { title, author, url, likes, username } = request.body;
  if (!title || !url) {
    logger.error("title and/or url missing");
    return response.status(400).json({
      error: "title and/or url missing",
    });
  } // checks for more bad values like: null, undefined, NaN, empty string, 0, false

  // find a random user to associate with this blog entry (for now)
  // const users = await User.find();
  // const randomUser = users[Math.floor(Math.random() * users.length)];
  // const user = randomUser;

  // associate the blog entry with the given username
  // const check_user_exists = await User.findOne({ username: username });
  // if (!check_user_exists) {
  //   logger.error("Username does not exist");
  //   return response.status(400).json({
  //     error: "Username does not exist",
  //   });
  // }
  // const user = check_user_exists;

  // associate the blog entry with the username who has a token
  // make sure token is valid, the user holding the token is the same as the username on the post
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  // logger.info("decodedToken", decodedToken);
  if (!decodedToken.id) {
    logger.error("token invalid");
    return response.status(401).json({ error: 'token invalid' })
  }
  const referenced_blog = await Blog.findById(request.params.id); // not 'toJSON' format
  const token_user = await User.findById(decodedToken.id) // not 'toJSON' format
  // logger.info("token_user", token_user);
  // logger.info("referenced_blog", referenced_blog);
  if (token_user._id.toString() !== referenced_blog.user_id.toString()) { // not 'toJSON' format
    logger.error("username does not hold auth");
    return response.status(401).json({ error: 'username does not hold auth' })
  }
  const user = token_user;

  const entry_obj = {
    title: title,
    author: author,
    url: url,
    likes: likes || 0, // if likes is missing, set it to 0
    user_id: user.id || user._id,
  };
  const updatedEntry = await Blog.findByIdAndUpdate(
    request.params.id,
    entry_obj,
    {
      new: true,
      runValidators: true,
      context: "query",
    }
  ).populate("user_id", {
    username: 1,
    name: 1,
  });
  if (updatedEntry) {
    response.json(updatedEntry);
  } else {
    response.status(404).end();
  }
});
// check requests/update***.rest files for testing

blogsRouter.delete("/:id", async (request, response) => {

  // associate the blog entry with the username who has a token
  // make sure token is valid, the user holding the token is the same as the username on the post
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  // logger.info("decodedToken", decodedToken);
  if (!decodedToken.id) {
    logger.error("token invalid");
    return response.status(401).json({ error: 'token invalid' })
  }
  const referenced_blog = await Blog.findById(request.params.id); // not 'toJSON' format
  const token_user = await User.findById(decodedToken.id) // not 'toJSON' format
  // logger.info("token_user", token_user);
  // logger.info("referenced_blog", referenced_blog);
  if (token_user._id.toString() !== referenced_blog.user_id.toString()) { // not 'toJSON' format
    logger.error("username does not hold auth");
    return response.status(401).json({ error: 'username does not hold auth' })
  }
  const user = token_user;

  const blog = await Blog.findById(request.params.id);
  if (blog) {
    await Blog.findByIdAndDelete(request.params.id);
    await User.updateOne({ _id: blog.user_id }, { $pull: { blogs: blog._id } }); // remove blog from user's list of blogs
    response.status(204).end();
  } else {
    response.status(404).end();
  }
});
// check requests/delete***.rest files for testing

module.exports = blogsRouter;
