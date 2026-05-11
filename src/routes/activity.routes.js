const express = require("express");
const activityController = require("../controllers/activity.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/", activityController.listActivities);
router.get("/:id", activityController.getActivity);
router.post("/", requireAuth, activityController.createActivity);
router.post("/:id/like", requireAuth, activityController.likeActivity);

module.exports = router;
