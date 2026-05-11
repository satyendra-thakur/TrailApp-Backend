const express = require("express");
const homestayController = require("../controllers/homestay.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/", homestayController.listHomestays);
router.get("/:id", homestayController.getHomestay);
router.post("/", requireAuth, homestayController.createHomestay);
router.patch("/:id", requireAuth, homestayController.updateHomestay);
router.delete("/:id", requireAuth, homestayController.deleteHomestay);

module.exports = router;
