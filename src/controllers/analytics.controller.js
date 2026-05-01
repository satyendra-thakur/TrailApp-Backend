const analyticsService = require("../services/analytics.service");

const getOverview = async (req, res, next) => {
  try {
    const data = await analyticsService.getOverview();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getPremiumAnalytics = async (req, res, next) => {
  try {
    const data = await analyticsService.getPremiumAnalytics();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOverview,
  getPremiumAnalytics
};
