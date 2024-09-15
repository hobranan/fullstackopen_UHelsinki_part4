const logger = require("../utils/logger");

const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  let sum = 0;
  blogs.forEach(function (entry) {
    sum += entry.likes;
  });
  logger.info(sum);
  return sum;
};

const favoriteBlog = (blogs) => {
  let max = 0;
  let fav = {};
  blogs.forEach(function (entry) {
    if (entry.likes > max) {
      max = entry.likes;
      fav = entry;
    }
  });
  const temp_fav = {
    title: fav.title,
    author: fav.author,
    likes: fav.likes,
  };
  logger.info(temp_fav);
  return temp_fav;
};

const mostBlogs = (blog_array) => {
  let max = 0;
  let result = {};
  blog_array.forEach(function (entry) {
    if (entry.blogs > max) {
      max = entry.blogs;
      result = entry;
    }
  });
  const final_result = {
    author: result.author,
    blogs: result.blogs,
  };
  logger.info(final_result);
  return final_result;
};

const mostLikes = (blogs) => {
  let max = 0;
  let result = {};
  blogs.forEach(function (entry) {
    if (entry.likes > max) {
      max = entry.likes;
      result = entry;
    }
  });
  const final_result = {
    author: result.author,
    likes: result.likes,
  };
  logger.info(final_result);
  return final_result;
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
};
