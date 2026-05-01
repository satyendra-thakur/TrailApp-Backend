const express = require("express");
const adminController = require("../controllers/admin.controller");
const { requireAuth, requireRole } = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(requireAuth);
router.use(requireRole("moderator", "admin", "super_admin"));

router.get("/pending", adminController.getPendingApprovals);
router.patch("/trails/:trailId/decision", adminController.moderateTrail);
router.patch("/homestays/:homestayId/decision", adminController.moderateHomestay);
router.patch("/reviews/:reviewId/decision", adminController.moderateReview);

module.exports = router;
