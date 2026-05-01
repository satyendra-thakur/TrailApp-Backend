const express = require("express");
const checklistController = require("../controllers/checklist.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/:trailId", requireAuth, checklistController.getChecklist);
router.put("/:trailId/items", requireAuth, checklistController.replaceItems);
router.post("/:trailId/items", requireAuth, checklistController.addItem);
router.patch(
  "/:trailId/items/:itemId",
  requireAuth,
  checklistController.updateItem
);
router.delete(
  "/:trailId/items/:itemId",
  requireAuth,
  checklistController.removeItem
);

module.exports = router;
