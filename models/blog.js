// require('dotenv').config() // Loads .env file contents into process.env by default
const logger = require("../utils/logger");
const config = require("../utils/config");
const url = config.MONGODB_URI;

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
logger.info("connecting to", url);
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on("error", (error) => {
  logger.info("error connecting to MongoDB:", error.message);
});
db.once("open", () => {
  logger.info("connected to MongoDB");
});

// const blogSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     minLength: 3,
//     required: [true, 'name required'],
//   },
//   number: { // already had custom validator in the schema
//     type: String,
//     minLength: 8,
//     validate: {
//       validator: function (v) {
//         return /^\d{2}-\d{7}$/.test(v) || /^\d{3}-\d{8}$/.test(v)
//       },
//       message: (props) => `${props.value} is not a valid phone number!`,
//     },
//     required: [true, 'phone number required'],
//   },
// })
const blogSchema = new mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number,
});
// blogSchema.set("toJSON", {
//   transform: (document, returnedObject) => {
//     returnedObject.id = returnedObject._id.toString(); // converts mongoDB's '_id' to our '.id'
//     delete returnedObject._id;
//     delete returnedObject.__v;
//   },
// });

module.exports = mongoose.model("Blog", blogSchema); // mongodb Atlas sees plural lowercase form of this
