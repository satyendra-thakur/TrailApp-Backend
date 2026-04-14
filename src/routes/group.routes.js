const express = require("express");
const groupController = require("../controllers/group.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/", requireAuth, groupController.createGroup);
router.post("/join", requireAuth, groupController.joinGroup);

module.exports = router;
