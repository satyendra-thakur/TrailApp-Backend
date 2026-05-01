const subscriptionService = require("../services/subscription.service");

const getPlans = async (req, res, next) => {
  try {
    const data = await subscriptionService.getPlans();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const createCheckout = async (req, res, next) => {
  try {
    const data = await subscriptionService.createCheckout(req.user.id, req.body.planCode);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getMySubscription = async (req, res, next) => {
  try {
    const data = await subscriptionService.getMySubscription(req.user.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const cancelSubscription = async (req, res, next) => {
  try {
    const data = await subscriptionService.cancelSubscription(req.user.id, req.params.subscriptionId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPlans,
  createCheckout,
  getMySubscription,
  cancelSubscription
};
