const express = require("express");
const localServiceController = require("../controllers/localservice.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/", localServiceController.listLocalServices);
router.get("/:id", localServiceController.getLocalService);
router.post("/", requireAuth, localServiceController.createLocalService);

module.exports = router;
