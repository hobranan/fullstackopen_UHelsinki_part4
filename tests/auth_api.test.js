const { describe, before, beforeEach, test, after } = require("node:test");
const helper = require("./test_helper");
const assert = require("node:assert");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app.app); // supertest uses app.js, but doesn't need index.js port listener because it's internally handled

const User = require("../models/user");

describe("when there is initially one user in db", () => {
  beforeEach(async () => {
    await User.deleteMany({});
    const passwordHash = await bcrypt.hash("sekret", 10);
    const user = new User({ username: "root", passwordHash });
    await user.save();
  });

  test("creation succeeds with a fresh username", async () => {
    const usersAtStart = await helper.usersInDb();
    const newUser = {
      username: "mluukkai",
      name: "Matti Luukkainen",
      password: "salainen",
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

  test("failing a new user's username that's invalid", async () => {
    const newUser = {
      username: "ml",
      name: "Michel",
      password: "salainen",
    };
    const result = await api
      .post("/api/users")
      .send(newUser);
    assert.strictEqual(result.status, 400);
  });

  test("failing a new user's username that's already taken", async () => {
    const newUser = {
      username: "ghjojojojojjo",
      name: "Mifdfsdfchel",
      password: "sadsfsdfsdffsdf",
    };
    const result = await api
      .post("/api/users")
      .send(newUser);
    assert.strictEqual(result.status, 201);

    const newUser2 = {
      username: "ghjojojojojjo",
      name: "Mifdfsdfchel",
      password: "sadsfsdfsdffsdf",
    };
    const result2 = await api
      .post("/api/users")
      .send(newUser2);
    assert.strictEqual(result2.status, 400);
    assert.strictEqual(result2.body.error, "expected `username` to be unique");
  });

  test("failing a new user's password that's invalid", async () => {
    const newUser = {
      username: "mlagagtun",
      name: "Michel",
      password: "sa",
    };
    const result = await api
      .post("/api/users")
      .send(newUser);
    assert.strictEqual(result.status, 400);
  });
});

after(async () => {
  await mongoose.connection.close();
});
