const { describe, before, test, after } = require("node:test");
const helper = require("./test_helper");
const assert = require("node:assert");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app.app); // supertest uses app.js, but doesn't need index.js port listener because it's internally handled

const Blog = require("../models/blog");
const User = require("../models/user");

// npm test -- tests/_2_blog_api.test.js

// * we keep the users from previous #1 test in DB
describe("empty db, basic Blog functionality", () => {
  before(async () => {
    await Blog.deleteMany({});
    console.log("cleared all blogs in blog collection");

    await User.updateMany({}, { $set: { blogs: [] } });
    console.log("cleared all users' blogs in user collection");
    
    // const entries = helper.initialBlogs.map((item) => new Blog(item));
    // const promiseArray = entries.map((item) => item.save());
    // await Promise.all(promiseArray); // good for parallel processing
    // console.log("done");

    // for (let item of helper.initialBlogs) {
    //   let entry = new Blog(item);
    //   await entry.save();
    // } // good for in-order processing

    console.log("done 'before'");
  });

  test("post new blog: passing", async () => {
    const blogsAtStart = await helper.blogs_InDb();
    assert.strictEqual(blogsAtStart.length, 0);
    const newBlog = {
      title: "test post",
      author: "Jill dill",
      url: "https://www.marytom.com",
      likes: 31,
      username: "bnoname",
    };
    await api
      .post("/api/blogs")
      .send(newBlog)
      .expect(201)
      .expect("Content-Type", /application\/json/);
    const blogsAtEnd = await helper.blogs_InDb();
    assert.strictEqual(blogsAtEnd.length, blogsAtStart.length + 1);
    const local_blogs = blogsAtEnd.map((b) => b.title);
    assert(local_blogs.includes(newBlog.title));
  });

  test("get blogs, as json: passing", async () => {
    await api
      .get("/api/blogs")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  test("post 2 more blogs: passing", async () => {
    const blogsAtStart = await helper.blogs_InDb();
    const newBlog = {
      title: "HTML is easy",
      author: "John Doe",
      url: "https://www.example.com",
      likes: 5,
      username: "bnoname",
    };
    await api
      .post("/api/blogs")
      .send(newBlog)
      .expect(201)
      .expect("Content-Type", /application\/json/);
    const blogsAtEnd1 = await helper.blogs_InDb();
    assert.strictEqual(blogsAtEnd1.length, blogsAtStart.length + 1);
    const newBlog2 = {
      title: "Browser can execute only Javascript",
      author: "Bill Turner",
      url: "https://www.weathernews.com",
      likes: 25,
      username: "therealtom",
    };
    await api
      .post("/api/blogs")
      .send(newBlog2)
      .expect(201)
      .expect("Content-Type", /application\/json/);
    const blogsAtEnd2 = await helper.blogs_InDb();
    assert.strictEqual(blogsAtEnd2.length, blogsAtStart.length + 2);
    const local_blogs = blogsAtEnd2.map((b) => b.title);
    assert(local_blogs.includes(newBlog.title));
    assert(local_blogs.includes(newBlog2.title));
  });

  // test("get blogs, verify each has unique id", async () => {
  //   const response = await api.get("/api/blogs");
  //   response.body.forEach((item) => {
  //     // console.log(item.id);
  //     // console.log(item._id);
  //     assert.strictEqual(item.id, item._id);
  //   });
  // });

  test("post to blogs: failing, without title", async () => {
    const response1 = await api.post("/api/blogs").send({
      author: "Jill dillernoauth",
      url: "https://www.marytomernoauth.com",
      likes: 5000,
      username: "bnoname",
    });
    assert.strictEqual(response1.status, 400);
  });

  test("post to blogs: failing, without url", async () => {
    const response2 = await api.post("/api/blogs").send({
      title: "ttttttttttt",
      author: "Jill nourl",
      likes: 888,
      username: "bnoname",
    });
    assert.strictEqual(response2.status, 400);
  });

  test("post to blogs, new count, and get that post: passing", async () => {
    const check_blogs_length = await helper.blogs_InDb();
    const response = await api.post("/api/blogs").send({
      title: "test post to get",
      author: "Jack sparrow",
      url: "https://www.piratesofmars.com",
      likes: 31,
      username: "bnoname",
    });
    const check_id = response.body.id;
    assert.strictEqual(response.status, 201);
    const check2_blogs_length = await helper.blogs_InDb();
    assert.strictEqual(
      check2_blogs_length.length,
      check_blogs_length.length + 1
    );
    const check3 = await api.get("/api/blogs/" + check_id);
    assert.strictEqual(check3.body.title, "test post to get");
    assert.strictEqual(check3.body.author, "Jack sparrow");
    assert.strictEqual(check3.body.url, "https://www.piratesofmars.com");
    assert.strictEqual(check3.body.likes, 31);
  });

  test("post to blogs with likes and without: passing", async () => {
    const response1 = await api.post("/api/blogs").send({
      title: "the liked post",
      author: "The only person",
      url: "https://www.marymarymary.com",
      likes: 100,
      username: "bnoname",
    });
    const check_id1 = response1.body.id;
    assert.strictEqual(response1.status, 201);
    const receive_check1 = await api.get("/api/blogs/" + check_id1);
    assert.strictEqual(receive_check1.body.title, "the liked post");
    assert.strictEqual(receive_check1.body.author, "The only person");
    assert.strictEqual(receive_check1.body.url, "https://www.marymarymary.com");
    assert.strictEqual(receive_check1.body.likes, 100);

    const response2 = await api.post("/api/blogs").send({
      title: "the not liked post",
      author: "The only person",
      url: "https://www.marymarymary.com",
      username: "bnoname",
      // likes: 100, // defaults to 0 if missing
    });
    const check_id2 = response2.body.id;
    assert.strictEqual(response2.status, 201);
    const receive_check2 = await api.get("/api/blogs/" + check_id2);
    assert.strictEqual(receive_check2.body.title, "the not liked post");
    assert.strictEqual(receive_check2.body.author, "The only person");
    assert.strictEqual(receive_check2.body.url, "https://www.marymarymary.com");
    assert.strictEqual(receive_check2.body.likes, 0);
  });

  test("post new blog, then update/put it: passing", async () => {
    const response = await api.post("/api/blogs").send({
      title: "the update post",
      author: "updatooooros",
      url: "https://www.youneedupdate.com",
      likes: 90,
      username: "therealtom",
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
      username: "therealtom",
    });
    assert.strictEqual(response2.status, 200);
    const check2 = await api.get("/api/blogs/" + check_id);
    assert.strictEqual(check2.body.title, "the update post");
    assert.strictEqual(check2.body.author, "updatooooros");
    assert.strictEqual(check2.body.url, "https://www.youneedupdate.com");
    assert.strictEqual(check2.body.likes, 999999);
  });

  test("post new blog, check, then delete: passing", async () => {
    const response = await api.post("/api/blogs").send({
      title: "the delete post",
      author: "deletoormon",
      url: "https://www.togrow.com",
      likes: 45,
      username: "therealtom",
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

  after(async () => {
    await mongoose.connection.close();
  });
});
