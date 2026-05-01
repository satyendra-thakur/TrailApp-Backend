const express = require("express");
const subscriptionController = require("../controllers/subscription.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/plans", subscriptionController.getPlans);
router.post("/checkout", requireAuth, subscriptionController.createCheckout);
router.get("/me", requireAuth, subscriptionController.getMySubscription);
router.patch("/:subscriptionId/cancel", requireAuth, subscriptionController.cancelSubscription);

module.exports = router;
