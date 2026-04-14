require("dotenv").config();

const env = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGO_URI || "",
  jwtSecret: process.env.JWT_SECRET || "trailapp-dev-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d"
};

module.exports = { env };
