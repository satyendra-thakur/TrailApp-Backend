const express = require("express");
const trailController = require("../controllers/trail.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/", requireAuth, trailController.createTrail);
router.get("/", requireAuth, trailController.listTrails);
router.get("/:id", requireAuth, trailController.getTrail);
router.patch("/:id", requireAuth, trailController.updateTrail);
router.delete("/:id", requireAuth, trailController.deleteTrail);

router.post("/:id/waypoints", requireAuth, trailController.addWaypoint);
router.delete(
  "/:id/waypoints/:waypointId",
  requireAuth,
  trailController.removeWaypoint
);

router.put(
  "/:id/emergency-numbers",
  requireAuth,
  trailController.setEmergencyNumbers
);

router.get("/:id/export", requireAuth, trailController.exportBundle);

module.exports = router;
