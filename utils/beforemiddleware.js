const cors = require("cors"); // https://github.com/expressjs/cors (needs: npm install cors)

var morgan = require("morgan"); // https://github.com/expressjs/morgan (needs: npm install morgan)
morgan.token("content", function (req) {
  return JSON.stringify(req.body);
}); // custom token to log the body of the request

const tokenExtractor = (request, response, next) => {
  const authorization = request.get("authorization");
  if (authorization && authorization.startsWith("Bearer ")) {
    request.token = authorization.replace("Bearer ", ""); // removes the "Bearer " part from the token
  } else {
    request.token = null;
  }
  next(); // call the next middleware
};

module.exports = {
  cors,
  morgan,
  tokenExtractor,
};
