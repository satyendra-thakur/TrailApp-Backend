const { connectDatabase } = require("../config/database");
const subscriptionService = require("../services/subscription.service");

const seedPlans = async () => {
  try {
    await connectDatabase();
    await subscriptionService.seedDefaultPlans();
    console.log("Subscription plans seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed subscription plans", error.message);
    process.exit(1);
  }
};

seedPlans();
