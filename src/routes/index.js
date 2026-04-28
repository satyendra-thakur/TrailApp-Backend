const express = require("express");
const healthRoutes = require("./health.routes");
const authRoutes = require("./auth.routes");
const profileRoutes = require("./profile.routes");
const groupRoutes = require("./group.routes");
const adminRoutes = require("./admin.routes");

const router = express.Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);
router.use("/groups", groupRoutes);
router.use("/admin", adminRoutes);

module.exports = router;
