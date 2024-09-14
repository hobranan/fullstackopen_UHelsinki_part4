const cors = require("cors"); // https://github.com/expressjs/cors (needs: npm install cors)

var morgan = require("morgan"); // https://github.com/expressjs/morgan (needs: npm install morgan)
morgan.token("content", function (req) {
  return JSON.stringify(req.body);
}); // custom token to log the body of the request

module.exports = {
  cors,
  morgan,
};
