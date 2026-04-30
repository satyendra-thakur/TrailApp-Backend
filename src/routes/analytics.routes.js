const express = require("express");
const analyticsController = require("../controllers/analytics.controller");
const { requireAuth, requireRole } = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(requireAuth);
router.use(requireRole("admin", "super_admin"));

router.get("/overview", analyticsController.getOverview);
router.get("/premium", analyticsController.getPremiumAnalytics);

module.exports = router;
