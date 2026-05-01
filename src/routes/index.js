const express = require("express");
const healthRoutes = require("./health.routes");
const authRoutes = require("./auth.routes");
const profileRoutes = require("./profile.routes");
const groupRoutes = require("./group.routes");
const trailRoutes = require("./trail.routes");
const checklistRoutes = require("./checklist.routes");
const messageRoutes = require("./message.routes");
const adminRoutes = require("./admin.routes");
const analyticsRoutes = require("./analytics.routes");
const subscriptionRoutes = require("./subscription.routes");
const paymentRoutes = require("./payment.routes");
const premiumRoutes = require("./premium.routes");
const mapRoutes = require("./map.routes");

const router = express.Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);
router.use("/groups", groupRoutes);
router.use("/groups", messageRoutes);
router.use("/trails", trailRoutes);
router.use("/checklists", checklistRoutes);
router.use("/admin", adminRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/subscriptions", subscriptionRoutes);
router.use("/payments", paymentRoutes);
router.use("/premium", premiumRoutes);
router.use("/map", mapRoutes);

module.exports = router;
