const { before, test, after } = require("node:test");
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

before(async () => {
  await Blog.deleteMany({});
  let blogObject = new Blog(initialBlogs[0]);
  await blogObject.save();
  blogObject = new Blog(initialBlogs[1]);
  await blogObject.save();
});

test("entries are returned as json", async () => {
  await api
    .get("/api/blogs")
    .expect(200)
    .expect("Content-Type", /application\/json/);
});

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

test("post to blogs, new count, and get that post", async () => {
  const check = await api.get("/api/blogs");
  assert.strictEqual(check.body.length, initialBlogs.length);
  const response = await api.post("/api/blogs").send({
    title: "test post",
    author: "Jill dill",
    url: "https://www.marytom.com",
    likes: 31,
  });
  const check_id = response.body.id;
  assert.strictEqual(response.status, 201);
  const check2 = await api.get("/api/blogs");
  assert.strictEqual(check2.body.length, initialBlogs.length + 1);
  const check3 = await api.get("/api/blogs/" + check_id);
  assert.strictEqual(check3.body.title, "test post");
  assert.strictEqual(check3.body.author, "Jill dill");
  assert.strictEqual(check3.body.url, "https://www.marytom.com");
  assert.strictEqual(check3.body.likes, 31);
});

after(async () => {
  await mongoose.connection.close();
});
