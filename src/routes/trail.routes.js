const express = require("express");
const trailController = require("../controllers/trail.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(requireAuth);

router.post("/", trailController.createTrail);
router.get("/", trailController.listTrails);
router.get("/:trailId", trailController.getTrailById);

router.patch("/:trailId/stage", trailController.updatePlanningStage);
router.put("/:trailId/waypoints", trailController.replaceWaypoints);
router.put("/:trailId/emergency-numbers", trailController.replaceEmergencyNumbers);

router.post("/:trailId/checklist", trailController.addChecklistItem);
router.patch("/:trailId/checklist/:itemId", trailController.toggleChecklistItemPacked);
router.delete("/:trailId/checklist/:itemId", trailController.deleteChecklistItem);

router.post("/:trailId/offline-export", trailController.exportOfflineBundle);

module.exports = router;
