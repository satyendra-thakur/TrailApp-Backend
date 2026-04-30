const express = require("express");
const paymentController = require("../controllers/payment.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/webhook", paymentController.receiveWebhook);
router.post("/verify", requireAuth, paymentController.verifyPayment);

module.exports = router;
