const { describe, before, beforeEach, test, after } = require("node:test");
const helper = require("./test_helper");
const assert = require("node:assert");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app.app); // supertest uses app.js, but doesn't need index.js port listener because it's internally handled

const User = require("../models/user");
const Blog = require("../models/blog");

// npm test -- tests/_1_user_api.test.js

describe("empty db, basic User functionality", () => {
  before(async () => {
    await User.deleteMany({});
    console.log("cleared all users in DB");

    await Blog.deleteMany({});
    console.log("cleared all blogs in DB");

    console.log("done 'before'");
  });

  test("post new user: passing", async () => {
    const usersAtStart = await helper.usersInDb();
    assert.strictEqual(usersAtStart.length, 0);
    const newUser = {
      username: "bnoname",
      name: "Bob Noname",
      password: "this is mysekret",
    };
    await api
      .post("/api/users")
      .send(newUser)
      .expect(201)
      .expect("Content-Type", /application\/json/);
    const usersAtEnd = await helper.usersInDb();
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1);
    const usernames = usersAtEnd.map((u) => u.username);
    assert(usernames.includes(newUser.username));
  });

  test("get users, as json: passing", async () => {
    await api
      .get("/api/users")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  test("post second new username: passing", async () => {
    const usersAtStart = await helper.usersInDb();
    const newUser = {
      username: "therealtom",
      name: "Tom Verygood",
      password: "nopeimgood",
    };
    await api
      .post("/api/users")
      .send(newUser)
      .expect(201)
      .expect("Content-Type", /application\/json/);
    const usersAtEnd = await helper.usersInDb();
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1);
    const usernames = usersAtEnd.map((u) => u.username);
    assert(usernames.includes(newUser.username));
  });

  // test("get users, verify each has unique id", async () => {
  //   const response = await api.get("/api/users");
  //   response.body.forEach((item) => {
  //     // console.log(item.id);
  //     // console.log(item._id);
  //     assert.strictEqual(item.id, item._id);
  //   });
  // });

  test("post new user: failing, username that's invalid", async () => {
    const newUser = {
      username: "ml", // too short
      name: "Michel",
      password: "salainen",
    };
    const result = await api.post("/api/users").send(newUser);
    assert.strictEqual(result.status, 400);
  });

  test("post new user: failing, username that's already taken", async () => {
    const newUser2 = {
      username: "therealtom", // already taken
      name: "iwant his username",
      password: "thiswillfail",
    };
    const result2 = await api.post("/api/users").send(newUser2);
    assert.strictEqual(result2.status, 400);
    assert.strictEqual(result2.body.error, "username already taken");
  });

  test("post new user: failing, password that's invalid", async () => {
    const newUser = {
      username: "ghjojojojojjo",
      name: "Michel",
      password: "sa", // too short
    };
    const result = await api.post("/api/users").send(newUser);
    assert.strictEqual(result.status, 400);
  });

  test("post new user, then put/update: passing", async () => {
    const newUser = {
      username: "thepostmancometh",
      name: "John Posterboy",
      password: "John Posterboy",
    };
    const response = await api
      .post("/api/users")
      .send(newUser)
      .expect(201)
      .expect("Content-Type", /application\/json/);
    const username = response.body.username;
    const id = response.body.id;
    assert.strictEqual(username, newUser.username);

    const updatedUser = {
      username: "thepostmancometh2",
      name: "John Posterboy 2nd",
      password: "youwillnotguessyoutoo",
    };
    const result = await api
      .put(`/api/users/${id}`)
      .send(updatedUser)
      .expect(200)
      .expect("Content-Type", /application\/json/);
    assert.strictEqual(result.body.username, updatedUser.username);
    assert.strictEqual(result.body.name, updatedUser.name);
  });

  test("post new user, then delete: passing", async () => {
    const newUser = {
      username: "thedeathname",
      name: "Dea the Destroyer",
      password: "qwertybird",
    };
    const response = await api
      .post("/api/users")
      .send(newUser)
      .expect(201)
      .expect("Content-Type", /application\/json/);
    const username = response.body.username;
    const id = response.body.id;
    assert.strictEqual(username, newUser.username);

    await api.delete(`/api/users/${id}`).send().expect(204);
    const response2 = await api.get("/api/users/" + id);
    assert.strictEqual(response2.status, 404);
    const usersAtEnd = await helper.usersInDb();
    const usernames = usersAtEnd.map((u) => u.username);
    assert(!usernames.includes(newUser.username));
  });

  test("post new user, add blog, then delete: passing", async () => {
    const newUser = {
      username: "thedeathname2",
      name: "Dea the Destroyer2",
      password: "qwertybird2",
    };
    const response = await api
      .post("/api/users")
      .send(newUser)
      .expect(201)
      .expect("Content-Type", /application\/json/);
    const username = response.body.username;
    const id = response.body.id;
    assert.strictEqual(username, newUser.username);

    const response2 = await api.post("/api/blogs").send({
      title: "the delete post2",
      author: "deletoormon2",
      url: "https://www.to2grow.com",
      likes: 45,
      username: "thedeathname2",
    });
    const check_id = response2.body.id;
    assert.strictEqual(response2.status, 201);
    const check1 = await api.get("/api/blogs/" + check_id);
    assert.strictEqual(check1.body.title, "the delete post2");
    assert.strictEqual(check1.body.author, "deletoormon2");
    assert.strictEqual(check1.body.url, "https://www.to2grow.com");
    assert.strictEqual(check1.body.likes, 45);

    await api.delete(`/api/users/${id}`).send().expect(204);
    const response3 = await api.get("/api/users/" + id);
    assert.strictEqual(response3.status, 404);
    const usersAtEnd = await helper.usersInDb();
    const usernames = usersAtEnd.map((u) => u.username);
    assert(!usernames.includes(newUser.username));
  });

  after(async () => {
    await mongoose.connection.close();
  });
});
