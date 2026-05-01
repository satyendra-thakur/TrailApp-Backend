const express = require("express");
const premiumController = require("../controllers/premium.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/me", requireAuth, premiumController.getPremiumStatus);

module.exports = router;
