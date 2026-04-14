const mongoose = require("mongoose");
const { env } = require("./env");

const connectDatabase = async () => {
  if (!env.mongoUri) {
    throw new Error("MONGO_URI is required to connect to MongoDB");
  }

  await mongoose.connect(env.mongoUri);
  console.log("MongoDB connected");
};

module.exports = {
  connectDatabase
};
