//* declared libs and settings
// require('dotenv').config() // Loads .env file contents into process.env by default
const express = require("express");
require("express-async-errors");
const app = express();

//* before-route middleware moved to utils/beforemiddleware.js (note: middleware happens in the order they are defined)
const beforeroute_middleware = require("./utils/beforemiddleware");
app.use(express.json()); // this is a 'Express json-parser' middleware that parses incoming requests with JSON payloads
app.use(beforeroute_middleware.cors()); // this is a 'cors' middleware that allows requests from other origins
app.use(
  beforeroute_middleware.morgan(
    ":method :url :status :res[content-length] - :response-time ms :content"
  )
); // example output: POST /api/persons 200 58 - 4.794 ms {"name":"sample Name","number":"123-4458"}
app.use(express.static("dist")); // this is a 'static' middleware that serves static files from the 'dist' folder,...
// ...ref: https://fullstackopen.com/en/part3/deploying_app_to_internet#serving-static-files-from-the-backend
app.use(beforeroute_middleware.tokenExtractor); // this is a custom middleware that extracts the token from the request

//* routes moved to 'controllers' folder
const blogsRouter = require("./controllers/blogs");
//* use the beforemiddleware.userExtractor only in specific /api/blogs routes of: POST, PUT, DELETE
app.use("/api/blogs", blogsRouter); // this is a 'Express router' middleware that uses the routes defined in 'controllers/blogs.js'
const usersRouter = require("./controllers/users");
app.use("/api/users", usersRouter); // this is a 'Express router' middleware that uses the routes defined in 'controllers/users.js'
const loginRouter = require("./controllers/login");
app.use("/api/login", loginRouter); // this is a 'Express router' middleware that uses the routes defined in 'controllers/login.js'

//* moved to index.js
// app.listen(config.PORT, () => {
//   logger.info(`Server running on port ${config.PORT}`)
// })

//* after-route middleware moved to utils/aftermiddleware.js
const afteroute_middleware = require("./utils/aftermiddleware");
app.use(afteroute_middleware.unknownEndpoint); // this is a custom middleware that handles unknown routes
app.use(afteroute_middleware.errorHandler); // this is a custom middleware that logs requests; this has to be the last loaded middleware, also all the routes should be registered before this!

module.exports = {
  app,
};
