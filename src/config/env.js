require("dotenv").config();

const env = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGO_URI || "",
  jwtSecret: process.env.JWT_SECRET || "trailapp-dev-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  paymentGateway: process.env.PAYMENT_GATEWAY || "mock",
  clientWebUrl: process.env.CLIENT_WEB_URL || "http://localhost:3000",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || ""
};

module.exports = { env };
