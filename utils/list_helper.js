const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  let sum = 0;
  blogs.forEach(function (num) {
    sum += num.likes;
  });
  return sum;
};

module.exports = {
  dummy,
  totalLikes,
};
