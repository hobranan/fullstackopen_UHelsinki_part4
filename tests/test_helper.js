const Blog = require("../models/blog");
const User = require('../models/user');

// const initialBlogs = [
//   {
//     title: "HTML is easy",
//     author: "John Doe",
//     url: "https://www.example.com",
//     likes: 5,
//   },
//   {
//     title: "Browser can execute only Javascript",
//     author: "Bill Turner",
//     url: "https://www.weathernews.com",
//     likes: 25,
//   },
// ];

// const adv_user1_initialBlogs = [
//   {
//     title: "HTML is hard",
//     author: "John Doerrg",
//     url: "https://www.example12.com",
//     likes: 5,
//   },
//   {
//     title: "Bowser can execute only criminals",
//     author: "Bill Dotreev",
//     url: "https://www.weathernews12.com",
//     likes: 25,
//   },
// ];

// const adv_user2_initialBlogs = [
//   {
//     title: "The bees are running",
//     author: "Whitehorn Paul",
//     url: "https://www.dogsfillcats.com",
//     likes: 44,
//   },
// ];

// const nonExistingId = async () => {
//   const entry = new Blog(
//     { 
//         title: 'willremovethissoon',
//         author: 'willrem thissoon',
//         url: 'https://www.willremovethissoon.com',
//         likes: 77,
//     })
//   await entry.save()
//   await entry.deleteOne()
//   return entry._id.toString()
// }

const blogs_InDb = async () => {
  const entry = await Blog.find({})
  return entry.map(item => item.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({});
  return users.map((u) => u.toJSON());
};

const createFakeToken = (realToken, amountToChange) => {
  const lastChars = realToken.slice(-amountToChange).split('').map(char => {
    return char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase();
  }).join('');
  const fakeToken = realToken.slice(0, -amountToChange) + lastChars;
  return fakeToken;
}

module.exports = {
    // initialBlogs, 
    // adv_user1_initialBlogs,
    // adv_user2_initialBlogs,
    // nonExistingId,
    blogs_InDb,
    usersInDb,
    createFakeToken,
}