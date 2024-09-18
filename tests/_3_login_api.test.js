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

  // test("2 logins, each with posts", async () => {
  //   const thisUser2 = {
  //     username: "theusername2",
  //     password: "thesecretcode2",
  //   };
  //   const result2_1 = await api.post("/api/login").send(thisUser2);
  //   console.log("result2_1.body.id", result2_1.body.id);
  //   console.log("result2_1.body", result2_1.body);
  //   const user2_id = result2_1.body.id;
  //   assert.strictEqual(result2_1.status, 200);
  //   assert.strictEqual(result2_1.body.username, thisUser2.username);
  //   assert.strictEqual(result2_1.body.name, "theNAMEusername2");
  //   assert(result2_1.body.token);
  //   const result2_2 = await api.post("/api/blogs").send({
  //     title: "HTML is hard",
  //     author: "John Doerrg",
  //     url: "https://www.example12.com",
  //     likes: 5,
  //     userId: user2_id,
  //   });
  //   assert.strictEqual(result2_2.status, 201);
  //   const result2_3 = await api.post("/api/blogs").send({
  //     title: "Bowser can execute only criminals",
  //     author: "Bill Dotreev",
  //     url: "https://www.weathernews12.com",
  //     likes: 25,
  //     userId: user2_id,
  //   });
  //   assert.strictEqual(result2_3.status, 201);

  //   const thisUser1 = {
  //     username: "theusername1",
  //     password: "thesecretcode1",
  //   };
  //   const result1_1 = await api.post("/api/login").send(thisUser1);
  //   const user1_id = result1_1.body.id;
  //   assert.strictEqual(result1_1.status, 200);
  //   assert.strictEqual(result1_1.body.username, thisUser1.username);
  //   assert.strictEqual(result1_1.body.name, "theNAMEusername2");
  //   assert(result1_1.body.token);
  //   const result1_2 = await api.post("/api/blogs").send({
  //     title: "The bees are running",
  //     author: "Whitehorn Paul",
  //     url: "https://www.dogsfillcats.com",
  //     likes: 44,
  //     user: user1_id,
  //   });
  //   assert.strictEqual(result1_2.status, 201);
  // });

  after(async () => {
    await mongoose.connection.close();
  });
});
