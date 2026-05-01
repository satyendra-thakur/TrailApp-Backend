const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;

const connectTestDatabase = async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
};

const clearTestDatabase = async () => {
  const collections = mongoose.connection.collections;

  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
};

const disconnectTestDatabase = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();

  if (mongoServer) {
    await mongoServer.stop();
  }
};

module.exports = {
  connectTestDatabase,
  clearTestDatabase,
  disconnectTestDatabase
};
