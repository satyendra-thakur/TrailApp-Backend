const userStore = require("./user.store");

const applyPremiumAccess = async (userId, plan, subscription) => {
  const existingUser = await userStore.getById(userId);

  if (!existingUser) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return userStore.updateById(userId, {
    isPremium: true,
    premiumUntil: subscription.endDate ? subscription.endDate.toISOString() : null,
    premiumFeatures: {
      offlineMaps: Boolean(plan.features.offlineMaps),
      unlimitedTrails: Boolean(plan.features.unlimitedTrails),
      advancedAnalytics: Boolean(plan.features.advancedAnalytics)
    }
  });
};

const removePremiumAccess = async (userId) => {
  const existingUser = await userStore.getById(userId);

  if (!existingUser) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return userStore.updateById(userId, {
    isPremium: false,
    premiumUntil: null,
    premiumFeatures: {
      offlineMaps: false,
      unlimitedTrails: false,
      advancedAnalytics: false
    }
  });
};

const getPremiumStatus = async (userId, subscription) => {
  const user = await userStore.getById(userId);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return {
    isPremium: Boolean(user.isPremium),
    premiumUntil: user.premiumUntil || null,
    features: user.premiumFeatures || {
      offlineMaps: false,
      unlimitedTrails: false,
      advancedAnalytics: false
    },
    subscription
  };
};

module.exports = {
  applyPremiumAccess,
  removePremiumAccess,
  getPremiumStatus
};
