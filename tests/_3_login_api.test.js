const { describe, before, beforeEach, test, after } = require("node:test");
const helper = require("./test_helper");
const assert = require("node:assert");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app.app); // supertest uses app.js, but doesn't need index.js port listener because it's internally handled

const logger = require("../utils/logger");
const User = require("../models/user");
const Blog = require("../models/blog");

// npm test -- tests/_3_login_api.test.js

// * we keep the users and blogs from previous #1 nad #2 tests in DB
describe("empty db, basic User functionality", () => {
  before(async () => {
    // await User.deleteMany({});
    // console.log("cleared all users in DB");

    // await Blog.deleteMany({});
    // console.log("cleared all blogs in DB");

    console.log("done 'before'");
  });

  test("post new login (from current users): passing", async () => {
    const newLogin = {
      username: "bnoname",
      password: "this is mysekret",
    };
    const result = await api.post("/api/login").send(newLogin);
    assert.strictEqual(result.status, 200);
    assert(result.body.token);
    assert(result.body.name);
    assert.strictEqual(result.body.username, newLogin.username);
  });

  test("post new login (from current users): failing, bad password", async () => {
    const newLogin = {
      username: "therealtom",
      password: "nopeimgoodnot",
    };
    const result = await api.post("/api/login").send(newLogin);
    assert.strictEqual(result.status, 401);
  });

  test("post new login: failing, no known username", async () => {
    const newLogin = {
      username: "therealtomsomeothernoname",
      password: "nopeimgood",
    };
    const result = await api.post("/api/login").send(newLogin);
    assert.strictEqual(result.status, 401);
  });

  test("post new login (current user), get token, then post, update, and delete a blog: passing", async () => {
    const newLogin = {
      username: "bnoname",
      password: "this is mysekret",
    };
    const result = await api.post("/api/login").send(newLogin);
    assert.strictEqual(result.status, 200);
    assert(result.body.token);
    assert(result.body.name);
    assert.strictEqual(result.body.username, newLogin.username);

    const newBlog = {
      title: "The cats are running",
      author: "Blackbilled Paul",
      url: "https://www.dogsbitecats.com",
      likes: 444,
      username: newLogin.username,
    };
    const result2 = await api
      .post("/api/blogs")
      .set("Authorization", `Bearer ${result.body.token}`)
      .send(newBlog);
    assert.strictEqual(result2.status, 201);

    const updatedBlog = {
      title: "The cats are running2",
      author: "Blackbilled Paul2",
      url: "https://www.dogsbitecats2.com",
      likes: 4442,
      username: newLogin.username,
    };
    const result3 = await api
      .put(`/api/blogs/${result2.body.id}`)
      .set("Authorization", `Bearer ${result.body.token}`)
      .send(updatedBlog);
    assert.strictEqual(result3.status, 200);

    const result4 = await api
      .delete(`/api/blogs/${result2.body.id}`)
      .set("Authorization", `Bearer ${result.body.token}`);
    assert.strictEqual(result4.status, 204);
  });

  test("post new login (current user), get token, then post, then...: failing, bad token for update", async () => {
    const newLogin = {
      username: "bnoname",
      password: "this is mysekret",
    };
    const result = await api.post("/api/login").send(newLogin);
    assert.strictEqual(result.status, 200);
    assert(result.body.token);
    assert(result.body.name);
    assert.strictEqual(result.body.username, newLogin.username);

    const newBlog = {
      title: "The cats are running0",
      author: "Blackbilled Paul0",
      url: "https://www.dogsbitecats0.com",
      likes: 4404,
      username: newLogin.username,
    };
    const result2 = await api
      .post("/api/blogs")
      .set("Authorization", `Bearer ${result.body.token}`)
      .send(newBlog);
    assert.strictEqual(result2.status, 201);

    const updatedBlog = {
      title: "The cats are running20",
      author: "Blackbilled Paul20",
      url: "https://www.dogsbitecats20.com",
      likes: 44420,
      username: newLogin.username,
    };

    const realToken = result.body.token;
    const amountToChange = 10;
    const fakeToken = helper.createFakeToken(realToken, amountToChange);
    logger.info("realToken", realToken);
    logger.info("fakeToken", fakeToken);

    const result3 = await api
      .put(`/api/blogs/${result2.body.id}`)
      .set("Authorization", `Bearer ${fakeToken}`)
      .send(updatedBlog);
    assert.strictEqual(result3.status, 401);
  });

  test("post new login (current user), get token, then post, and update, then...: failing, bad token for delete", async () => {
    const newLogin = {
      username: "bnoname",
      password: "this is mysekret",
    };
    const result = await api.post("/api/login").send(newLogin);
    assert.strictEqual(result.status, 200);
    assert(result.body.token);
    assert(result.body.name);
    assert.strictEqual(result.body.username, newLogin.username);

    const newBlog = {
      title: "The cats are running00",
      author: "Blackbilled Paul00",
      url: "https://www.dogsbitecats00.com",
      likes: 44400,
      username: newLogin.username,
    };
    const result2 = await api
      .post("/api/blogs")
      .set("Authorization", `Bearer ${result.body.token}`)
      .send(newBlog);
    assert.strictEqual(result2.status, 201);

    const updatedBlog = {
      title: "The cats are running200",
      author: "Blackbilled Paul200",
      url: "https://www.dogsbitecats200.com",
      likes: 444200,
      username: newLogin.username,
    };
    const result3 = await api
      .put(`/api/blogs/${result2.body.id}`)
      .set("Authorization", `Bearer ${result.body.token}`)
      .send(updatedBlog);
    assert.strictEqual(result3.status, 200);

    const realToken = result.body.token;
    const amountToChange = 10;
    const fakeToken = helper.createFakeToken(realToken, amountToChange);
    logger.info("realToken", realToken);
    logger.info("fakeToken", fakeToken);

    const result4 = await api
      .delete(`/api/blogs/${result2.body.id}`)
      .set("Authorization", `Bearer ${fakeToken}`);
    assert.strictEqual(result4.status, 401);
  });

  test("failing: no login, failed post", async () => {
    const newBlog = {
      title: "The cats are running0",
      author: "Blackbilled Paul0",
      url: "https://www.dogsbitecats0.com",
      likes: 4404,
      username: "random no login guy",
    };
    const result2 = await api.post("/api/blogs").send(newBlog);
    assert.strictEqual(result2.status, 401);
  });

  test("failing: no login, failed put/change of someone else's and failed delete of someone else's", async () => {
    const newLogin = {
      username: "bnoname",
      password: "this is mysekret",
    };
    const result = await api.post("/api/login").send(newLogin);
    assert.strictEqual(result.status, 200);
    assert(result.body.token);
    assert(result.body.name);
    assert.strictEqual(result.body.username, newLogin.username);

    const newBlog = {
      title: "The cats are running dont change",
      author: "Blackbilled Paul dont chnage",
      url: "https://www.dogsbitechnage.com",
      likes: 434534,
      username: newLogin.username,
    };

    const result2 = await api
      .post("/api/blogs")
      .set("Authorization", `Bearer ${result.body.token}`)
      .send(newBlog);
    assert.strictEqual(result2.status, 201);

    const updatedBlog_fromRandomGuy = {
      title: "The cats are running i try change",
      author: "Blackbilled Paul i try chnage",
      url: "https://www.dogsbitechnagethis.com",
      likes: 4345343424,
      username: newLogin.username,
    };
    const result3 = await api
      .put("/api/blogs/" + result2.body.id)
      .send(updatedBlog_fromRandomGuy); // no auth header
    assert.strictEqual(result3.status, 401);

    const result4 = await api
      .delete("/api/blogs/" + result2.body.id)
      .send(updatedBlog_fromRandomGuy); // no auth header
    assert.strictEqual(result4.status, 401);
  });

  after(async () => {
    await mongoose.connection.close();
  });
});
