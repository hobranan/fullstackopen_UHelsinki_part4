const cors = require("cors"); // https://github.com/expressjs/cors (needs: npm install cors)
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const logger = require("./logger");

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

const userExtractor = async (request, response, next) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET);
  // logger.info("decodedToken", decodedToken);
  if (!decodedToken.id) {
    logger.error("token invalid");
    return response.status(401).json({ error: "token invalid" });
  }
  const token_user = await User.findById(decodedToken.id);
  if (!token_user) {
    return response.status(401).json({ error: "user not found" });
  }
  // logger.info("token_user", token_user);
  request.user = token_user; // add the user to the request object
  next();
}

module.exports = {
  cors,
  morgan,
  tokenExtractor,
  userExtractor,
};
