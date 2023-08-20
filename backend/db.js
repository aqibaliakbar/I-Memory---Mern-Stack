const mongoose = require("mongoose");

const mongoURI = "mongodb://0.0.0.0:27017/notememory";

const connectToMongo = () => {
  mongoose
    .connect(mongoURI)
    .then(() => console.log("Successfully connected to Mongo"))

    .catch((err) => {
      console.error(err);
    });
};

module.exports = connectToMongo;
