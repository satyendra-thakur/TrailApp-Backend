const express = require("express");
const eventController = require("../controllers/event.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/", eventController.listEvents);
router.get("/:id", eventController.getEvent);
router.post("/", requireAuth, eventController.createEvent);
router.post("/:id/join", requireAuth, eventController.joinEvent);
router.post("/:id/leave", requireAuth, eventController.leaveEvent);

module.exports = router;
