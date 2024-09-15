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

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    minLength: 3,
    required: [true, 'name required'],
    unique: true, // this ensures the uniqueness of username // aftermiddlware.js handles the MongoServerError error message
  },
  name: String,
  passwordHash: String,
  blogs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
    },
  ],
});
userSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString(); // converts mongoDB's '_id' to our '.id'
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.passwordHash; // the passwordHash should not be revealed
  },
});

module.exports = mongoose.model("User", userSchema); // mongodb Atlas sees plural lowercase form of this
