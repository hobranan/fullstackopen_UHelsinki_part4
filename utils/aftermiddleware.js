const logger = require("../utils/logger");

const unknownEndpoint = (request, response) => {
  logger.error("unknown endpoint");
  response.status(404).send({ error: "unknown endpoint" });
};

// below is the custom middleware that handles errors (from routes with 'next' function)...
// can test with http://localhost:3001/api/persons/66e4d4c879 for fail 400 example {"error":"malformatted id"}
const errorHandler = (error, request, response, next) => {
  logger.error(error.message);
  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  } else if (
    error.name === "MongoServerError" &&
    error.message.includes("E11000 duplicate key error")
  ) {
    return response
      .status(400)
      .json({ error: "expected `username` to be unique" });
  } else if (error.name === "JsonWebTokenError") {
    return response.status(401).json({ error: "token invalid" });
  }
  next(error);
};

module.exports = {
  unknownEndpoint,
  errorHandler,
};
