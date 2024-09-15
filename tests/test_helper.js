const Blog = require("../models/blog");
const User = require('../models/user');

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

// const entriesInDb = async () => {
//   const entry = await Blog.find({})
//   return entry.map(item => item.toJSON())
// }

const usersInDb = async () => {
  const users = await User.find({});
  return users.map((u) => u.toJSON());
};

module.exports = {
    initialBlogs, 
    // nonExistingId,
    // entriesInDb,
    usersInDb
}