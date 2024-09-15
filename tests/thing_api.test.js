const { before, test, after } = require("node:test");
const helper = require("./test_helper");
const assert = require("node:assert");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app.app); // supertest uses app.js, but doesn't need index.js port listener because it's internally handled

const Blog = require("../models/blog");

before(async () => {
  await Blog.deleteMany({});
  console.log("cleared");

  // const entries = helper.initialBlogs.map((item) => new Blog(item));
  // const promiseArray = entries.map((item) => item.save());
  // await Promise.all(promiseArray); // good for parallel processing
  // console.log("done");

  for (let item of helper.initialBlogs) {
    let entry = new Blog(item)
    await entry.save()
  } // good for in-order processing
  console.log("done");
});

test("entries are returned as json", async () => {
  await api
    .get("/api/blogs")
    .expect(200)
    .expect("Content-Type", /application\/json/);
});

test("count entries: 2", async () => {
  const response = await api.get("/api/blogs");
  assert.strictEqual(response.body.length, helper.initialBlogs.length);
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
  assert.strictEqual(check.body.length, helper.initialBlogs.length);
  const response = await api.post("/api/blogs").send({
    title: "test post",
    author: "Jill dill",
    url: "https://www.marytom.com",
    likes: 31,
  });
  const check_id = response.body.id;
  assert.strictEqual(response.status, 201);
  const check2 = await api.get("/api/blogs");
  assert.strictEqual(check2.body.length, helper.initialBlogs.length + 1);
  const check3 = await api.get("/api/blogs/" + check_id);
  assert.strictEqual(check3.body.title, "test post");
  assert.strictEqual(check3.body.author, "Jill dill");
  assert.strictEqual(check3.body.url, "https://www.marytom.com");
  assert.strictEqual(check3.body.likes, 31);
});

test("post, check, then delete", async () => {
  const response = await api.post("/api/blogs").send({
    title: "the delete post",
    author: "deletoormon",
    url: "https://www.togrow.com",
    likes: 45,
  });
  const check_id = response.body.id;
  assert.strictEqual(response.status, 201);
  const check1 = await api.get("/api/blogs/" + check_id);
  assert.strictEqual(check1.body.title, "the delete post");
  assert.strictEqual(check1.body.author, "deletoormon");
  assert.strictEqual(check1.body.url, "https://www.togrow.com");
  assert.strictEqual(check1.body.likes, 45);

  const response2 = await api.delete("/api/blogs/" + check_id);
  assert.strictEqual(response2.status, 204);
  const check2 = await api.get("/api/blogs/" + check_id);
  assert.strictEqual(check2.status, 404); // 404 = not found
});

test("post, then update(put)", async () => {
  const response = await api.post("/api/blogs").send({
    title: "the update post",
    author: "updatooooros",
    url: "https://www.youneedupdate.com",
    likes: 90,
  });
  const check_id = response.body.id;
  assert.strictEqual(response.status, 201);
  const check1 = await api.get("/api/blogs/" + check_id);
  assert.strictEqual(check1.body.title, "the update post");
  assert.strictEqual(check1.body.author, "updatooooros");
  assert.strictEqual(check1.body.url, "https://www.youneedupdate.com");
  assert.strictEqual(check1.body.likes, 90);

  const response2 = await api.put("/api/blogs/" + check_id).send({
    title: "the update post",
    author: "updatooooros",
    url: "https://www.youneedupdate.com",
    likes: 999999, // update likes
  });
  assert.strictEqual(response2.status, 200);
  const check2 = await api.get("/api/blogs/" + check_id);
  assert.strictEqual(check2.body.title, "the update post");
  assert.strictEqual(check2.body.author, "updatooooros");
  assert.strictEqual(check2.body.url, "https://www.youneedupdate.com");
  assert.strictEqual(check2.body.likes, 999999);
});

test("post to blogs with likes and without", async () => {
  const response1 = await api.post("/api/blogs").send({
    title: "test poster",
    author: "Jill diller",
    url: "https://www.marytomer.com",
    likes: 100,
  });
  const check_id1 = response1.body.id;
  assert.strictEqual(response1.status, 201);
  const receive_check1 = await api.get("/api/blogs/" + check_id1);
  assert.strictEqual(receive_check1.body.title, "test poster");
  assert.strictEqual(receive_check1.body.author, "Jill diller");
  assert.strictEqual(receive_check1.body.url, "https://www.marytomer.com");
  assert.strictEqual(receive_check1.body.likes, 100);

  const response2 = await api.post("/api/blogs").send({
    title: "test poster2",
    author: "Jill diller2",
    url: "https://www.marytomer2.com",
    // likes: 100, // defaults to 0 if missing
  });
  const check_id2 = response2.body.id;
  assert.strictEqual(response2.status, 201);
  const receive_check2 = await api.get("/api/blogs/" + check_id2);
  assert.strictEqual(receive_check2.body.title, "test poster2");
  assert.strictEqual(receive_check2.body.author, "Jill diller2");
  assert.strictEqual(receive_check2.body.url, "https://www.marytomer2.com");
  assert.strictEqual(receive_check2.body.likes, 0);
});

test("post to blogs, without title or url", async () => {
  const response1 = await api.post("/api/blogs").send({
    author: "Jill dillernoauth",
    url: "https://www.marytomernoauth.com",
    likes: 5000,
  });
  assert.strictEqual(response1.status, 400);

  const response2 = await api.post("/api/blogs").send({
    title: "ttttttttttt",
    author: "Jill nourl",
    likes: 888,
  });
  assert.strictEqual(response2.status, 400);
});

after(async () => {
  await mongoose.connection.close();
});
