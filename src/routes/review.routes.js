const express = require("express");
const reviewController = require("../controllers/review.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/", reviewController.listReviews);
router.post("/", requireAuth, reviewController.createReview);
router.post("/:id/report", requireAuth, reviewController.reportReview);

module.exports = router;
