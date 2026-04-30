const express = require("express");
const healthRoutes = require("./health.routes");
const authRoutes = require("./auth.routes");
const profileRoutes = require("./profile.routes");
const groupRoutes = require("./group.routes");
const trailRoutes = require("./trail.routes");
const checklistRoutes = require("./checklist.routes");

const router = express.Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);
router.use("/groups", groupRoutes);
router.use("/trails", trailRoutes);
router.use("/checklists", checklistRoutes);

module.exports = router;
