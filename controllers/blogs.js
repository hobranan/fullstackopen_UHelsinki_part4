const blogsRouter = require("express").Router();
const Blog = require("../models/blog"); // this is a 'mongoose' model that represents a person in the phonebook

// blogsRouter.get("/hello", (request, response) => {
//   response.send("<h1>Hello World!</h1>");
// }); //   http://localhost:3003/api/blogs/hello

blogsRouter.get("/", async (request, response) => {
  const result = await Blog.find({});
  response.json(result);
});
//   http://localhost:3003/api/blogs

blogsRouter.get("/:id", async (request, response) => {
  const item = await Blog.findById(request.params.id);
  if (item) {
    response.json(item);
  } else {
    response.status(404).end();
  }
});
// http://localhost:3003/api/blogs/66e4d4c87984387b834fe42a "jujujjjuju" example
// http://localhost:3003/api/blogs/66e4d4c87900000000000000 for fail 404 example
// http://localhost:3003/api/blogs/66e4d4c879 for fail 400 example {"error":"malformatted id"}

blogsRouter.post("/", async (request, response) => {
  //   const body = request.body;
  //   if (!body.name || !body.number) {
  //     return response.status(400).json({
  //       error: "name and/or number missing",
  //     });
  //   } // checks for more bad values like: null, undefined, NaN, empty string, 0, false
  //   const entry = new Blog({
  //     name: body.name,
  //     number: body.number,
  //   });
  const entry = new Blog(request.body);
  const result = await entry.save();
  response.status(201).json(result);
});
// check requests/create***.rest files for testing

// blogsRouter.put('/:id', (request, response, next) => {
//   const { name, number } = request.body
//   Blog.findByIdAndUpdate(
//     request.params.id,
//     { name, number },
//     { new: true, runValidators: true, context: 'query' }
//   )
//     .then((updatedNote) => {
//       response.json(updatedNote)
//     })
//     .catch((error) => next(error))
// }) // check requests/update***.rest files for testing

// blogsRouter.delete('/:id', (request, response, next) => {
//   Blog.findByIdAndDelete(request.params.id)
//     .then(() => {
//       response.status(204).end()
//     })
//     .catch((error) => next(error))
// })
// blogsRouter.delete('/:id', async (request, response) => {
//   await Blog.findByIdAndDelete(request.params.id)
//   response.status(204).end()
// }) // check requests/delete***.rest files for testing

// blogsRouter.get('/info', (request, response, next) => {
//   Blog.countDocuments({})
//     .then((count) => {
//       const date = new Date()
//       response.send(`
//         <h1>Collection has ${count} entries</h1>
//         <br/>
//         <h2>${date}</h2>
//         `) // use ` to write cleaner structured html code
//     })
//     .catch((error) => next(error))
// }) //   http://localhost:3003/api/blogs/info

module.exports = blogsRouter;
