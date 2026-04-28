const test = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");
const request = require("supertest");

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret";
process.env.PAYMENT_GATEWAY = "mock";

const app = require("../app");
const Trail = require("../models/trail.model");
const Subscription = require("../models/subscription.model");
const SubscriptionPlan = require("../models/subscription-plan.model");
const Payment = require("../models/payment.model");
const userStore = require("../services/user.store");
const {
  connectTestDatabase,
  clearTestDatabase,
  disconnectTestDatabase
} = require("./setup-test-db");

test.before(async () => {
  await connectTestDatabase();
});

test.after(async () => {
  await disconnectTestDatabase();
});

test.beforeEach(async () => {
  await clearTestDatabase();
  userStore.reset();
});

const createTokenForUser = (user) => {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET
  );
};

test("GET /api/health returns healthy response", async () => {
  const response = await request(app).get("/api/health");

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.success, true);
});

test("GET /api/subscriptions/plans returns seeded plans", async () => {
  await SubscriptionPlan.create({
    code: "PREMIUM_MONTHLY",
    name: "Premium Monthly",
    description: "Monthly premium plan",
    price: 9.99,
    currency: "USD",
    billingInterval: "monthly"
  });

  const response = await request(app).get("/api/subscriptions/plans");

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.data.length, 1);
});

test("GET /api/admin/pending rejects requests without token", async () => {
  const response = await request(app).get("/api/admin/pending");

  assert.equal(response.statusCode, 401);
  assert.equal(response.body.success, false);
});

test("admin can view pending moderation items", async () => {
  const adminUser = userStore.create({
    email: "admin@example.com",
    passwordHash: "hashed-password",
    fullName: "Admin User",
    role: "admin"
  });

  await Trail.create({
    title: "Everest Base Camp",
    createdBy: adminUser.id
  });

  const response = await request(app)
    .get("/api/admin/pending")
    .set("Authorization", `Bearer ${createTokenForUser(adminUser)}`);

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.data.trails.length, 1);
});

test("subscription checkout and payment verification activates premium access", async () => {
  const user = userStore.create({
    email: "premium@example.com",
    passwordHash: "hashed-password",
    fullName: "Premium User",
    role: "user"
  });

  await SubscriptionPlan.create({
    code: "PREMIUM_MONTHLY",
    name: "Premium Monthly",
    description: "Monthly premium plan",
    price: 9.99,
    currency: "USD",
    billingInterval: "monthly"
  });

  const token = createTokenForUser(user);

  const checkoutResponse = await request(app)
    .post("/api/subscriptions/checkout")
    .set("Authorization", `Bearer ${token}`)
    .send({ planCode: "PREMIUM_MONTHLY" });

  assert.equal(checkoutResponse.statusCode, 201);
  assert.equal(checkoutResponse.body.success, true);

  const transactionRef = checkoutResponse.body.data.payment.transactionRef;

  const verifyResponse = await request(app)
    .post("/api/payments/verify")
    .set("Authorization", `Bearer ${token}`)
    .send({ transactionRef });

  assert.equal(verifyResponse.statusCode, 200);
  assert.equal(verifyResponse.body.success, true);

  const updatedUser = userStore.getById(user.id);
  const subscription = await Subscription.findOne({ userId: user.id });
  const payment = await Payment.findOne({ userId: user.id });

  assert.equal(updatedUser.isPremium, true);
  assert.equal(subscription.status, "active");
  assert.equal(payment.status, "paid");
});
