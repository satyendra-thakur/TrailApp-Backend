const subscriptionService = require("../services/subscription.service");

const verifyPayment = async (req, res, next) => {
  try {
    const data = await subscriptionService.verifyPayment(req.body);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const receiveWebhook = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        received: true,
        body: req.body
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  verifyPayment,
  receiveWebhook
};
