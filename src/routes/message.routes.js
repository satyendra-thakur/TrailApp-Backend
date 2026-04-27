const express = require("express");
const messageController = require("../controllers/message.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/:groupId/messages", requireAuth, messageController.sendMessage);
router.get("/:groupId/messages", requireAuth, messageController.getGroupMessages);

module.exports = router;
