const premiumService = require("../services/premium.service");
const subscriptionService = require("../services/subscription.service");

const getPremiumStatus = async (req, res, next) => {
  try {
    const subscription = await subscriptionService.getMySubscription(req.user.id);
    const data = await premiumService.getPremiumStatus(req.user.id, subscription);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPremiumStatus
};
