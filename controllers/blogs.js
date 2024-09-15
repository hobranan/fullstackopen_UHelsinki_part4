const blogsRouter = require("express").Router();
const Blog = require("../models/blog"); // this is a 'mongoose' model that represents a blog in the phonebook
const User = require("../models/user"); // this is a 'mongoose' model that represents a user in the phonebook

blogsRouter.get("/", async (request, response) => {
  const result = await Blog.find({}).populate("user", {
    username: 1,
    name: 1,
  });
  response.json(result);
});
// http://localhost:3003/api/blogs

blogsRouter.get("/:id", async (request, response) => {
  const item = await Blog.findById(request.params.id);
  if (item) {
    response.json(item);
  } else {
    response.status(404).end();
  }
});
// http://localhost:3003/api/blogs/66e734db77c2901167975ecc good "HTML is easy" example
// http://localhost:3003/api/blogs/66e4d4c87900000000000000 for fail 404 example
// http://localhost:3003/api/blogs/66e4d4c879 for fail 400 example {"error":"malformatted id"}

blogsRouter.post("/", async (request, response) => {
  const body = request.body;
  if (!body.title || !body.url) {
    return response.status(400).json({
      error: "title and/or url missing",
    });
  } // checks for more bad values like: null, undefined, NaN, empty string, 0, false
  
  // const user = await User.findById(body.userId)
  const randomUser = await User.findOne(); // get the first user
  const user = randomUser; // use the first user
  
  const entry = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0, // if likes is missing, set it to 0
    user: user.id
  });
  const result = await entry.save();
  user.blogs = user.blogs.concat(result._id)
  await user.save()
  response.status(201).json(result);
});
// check requests/create***.rest files for testing

blogsRouter.put("/:id", async (request, response) => {
  const body = request.body;
  const entry = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
  };
  const updatedEntry = await Blog.findByIdAndUpdate(request.params.id, entry, {
    new: true,
    runValidators: true,
    context: "query",
  });
  if (updatedEntry) {
    response.json(updatedEntry);
  } else {
    response.status(404).end();
  }
});
// check requests/update***.rest files for testing

blogsRouter.delete("/:id", async (request, response) => {
  await Blog.findByIdAndDelete(request.params.id);
  response.status(204).end();
});
// check requests/delete***.rest files for testing

module.exports = blogsRouter;
