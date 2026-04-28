const crypto = require("crypto");
const Payment = require("../models/payment.model");
const Subscription = require("../models/subscription.model");
const SubscriptionPlan = require("../models/subscription-plan.model");
const { getPaymentGateway } = require("./payment.service");
const premiumService = require("./premium.service");
const userStore = require("./user.store");

const buildError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const createTransactionRef = () => {
  return `TX-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
};

const addIntervalDate = (billingInterval) => {
  const date = new Date();

  if (billingInterval === "yearly") {
    date.setFullYear(date.getFullYear() + 1);
    return date;
  }

  date.setMonth(date.getMonth() + 1);
  return date;
};

const getPlans = async () => {
  return SubscriptionPlan.find({ isActive: true }).sort({ price: 1 });
};

const createCheckout = async (userId, planCode) => {
  const user = userStore.getById(userId);
  if (!user) {
    throw buildError("User not found", 404);
  }

  const plan = await SubscriptionPlan.findOne({ code: String(planCode || "").trim(), isActive: true });
  if (!plan) {
    throw buildError("Subscription plan not found", 404);
  }

  const subscription = await Subscription.create({
    userId,
    plan: plan._id,
    gateway: process.env.PAYMENT_GATEWAY || "mock"
  });

  const payment = await Payment.create({
    userId,
    subscription: subscription._id,
    gateway: process.env.PAYMENT_GATEWAY || "mock",
    amount: plan.price,
    currency: plan.currency,
    transactionRef: createTransactionRef()
  });

  const gateway = getPaymentGateway();
  const checkout = await gateway.createCheckoutSession({ payment, plan, user });

  payment.checkoutUrl = checkout.checkoutUrl || "";
  payment.gatewayResponse = checkout.raw || {};
  payment.gateway = process.env.PAYMENT_GATEWAY || "mock";
  await payment.save();

  return {
    subscription,
    payment,
    checkout
  };
};

const verifyPayment = async ({ transactionRef, sessionId }) => {
  const gateway = getPaymentGateway();
  const verification = await gateway.verifyPayment({ transactionRef, sessionId });
  const resolvedTransactionRef = verification.transactionRef || transactionRef;

  if (!resolvedTransactionRef) {
    throw buildError("transactionRef or sessionId is required", 400);
  }

  const payment = await Payment.findOne({ transactionRef: resolvedTransactionRef }).populate({
    path: "subscription",
    populate: {
      path: "plan"
    }
  });

  if (!payment) {
    throw buildError("Payment not found", 404);
  }

  if (!verification.isPaid) {
    throw buildError("Payment verification failed", 400);
  }

  payment.status = "paid";
  payment.gatewayResponse = verification.raw || {};
  await payment.save();

  const subscription = await Subscription.findById(payment.subscription._id);
  subscription.status = "active";
  subscription.startDate = new Date();
  subscription.endDate = addIntervalDate(payment.subscription.plan.billingInterval);
  await subscription.save();

  const updatedUser = await premiumService.applyPremiumAccess(payment.userId, payment.subscription.plan, subscription);

  return {
    payment,
    subscription,
    user: updatedUser
  };
};

const getMySubscription = async (userId) => {
  return Subscription.findOne({ userId }).populate("plan").sort({ createdAt: -1 });
};

const cancelSubscription = async (userId, subscriptionId) => {
  const subscription = await Subscription.findOne({ _id: subscriptionId, userId }).populate("plan");

  if (!subscription) {
    throw buildError("Subscription not found", 404);
  }

  subscription.status = "cancelled";
  subscription.cancelledAt = new Date();
  await subscription.save();

  const updatedUser = await premiumService.removePremiumAccess(userId);

  return {
    subscription,
    user: updatedUser
  };
};

const seedDefaultPlans = async () => {
  const plans = [
    {
      code: "PREMIUM_MONTHLY",
      name: "Premium Monthly",
      description: "Offline maps, unlimited trails, and advanced analytics for one month",
      price: 9.99,
      currency: "USD",
      billingInterval: "monthly"
    },
    {
      code: "PREMIUM_YEARLY",
      name: "Premium Yearly",
      description: "Offline maps, unlimited trails, and advanced analytics for one year",
      price: 99.99,
      currency: "USD",
      billingInterval: "yearly"
    }
  ];

  for (const plan of plans) {
    await SubscriptionPlan.findOneAndUpdate({ code: plan.code }, plan, { upsert: true, new: true });
  }
};

module.exports = {
  getPlans,
  createCheckout,
  verifyPayment,
  getMySubscription,
  cancelSubscription,
  seedDefaultPlans
};
