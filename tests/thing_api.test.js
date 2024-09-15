const { test, after, beforeEach } = require("node:test");
const assert = require("node:assert");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app.app); // supertest uses app.js, but doesn't need index.js port listener because it's internally handled

const Blog = require("../models/blog");
const initialBlogs = [
  {
    title: "HTML is easy",
    author: "John Doe",
    url: "https://www.example.com",
    likes: 5,
  },
  {
    title: "Browser can execute only Javascript",
    author: "Bill Turner",
    url: "https://www.weathernews.com",
    likes: 25,
  },
];

beforeEach(async () => {
  await Blog.deleteMany({});
  let blogObject = new Blog(initialBlogs[0]);
  await blogObject.save();
  blogObject = new Blog(initialBlogs[1]);
  await blogObject.save();
});

// test("entries are returned as json", async () => {
//   await api
//     .get("/api/blogs")
//     .expect(200)
//     .expect("Content-Type", /application\/json/);
// });

test("count entries: 2", async () => {
  const response = await api.get("/api/blogs");
  assert.strictEqual(response.body.length, initialBlogs.length);
});

test("verify unique id", async () => {
  const response = await api.get("/api/blogs");
  response.body.forEach((item) => {
    // console.log(item.id);
    // console.log(item._id);
    assert.strictEqual(item.id, item._id);
  });
});

// test("the first entry is about HTTP methods", async () => {
//   const response = await api.get("/api/blogs");
//   const entry_titles = response.body.map((item) => item.title);
//   assert(entry_titles.includes("HTML is easy"), true);
// });

after(async () => {
  await mongoose.connection.close();
});
