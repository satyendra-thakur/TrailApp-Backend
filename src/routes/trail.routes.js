const express = require("express");
const trailController = require("../controllers/trail.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

const router = express.Router();

// Raw XML parser for GPX/KML imports (B3)
const xmlParser = express.text({
  type: [
    "application/gpx+xml",
    "application/vnd.google-earth.kml+xml",
    "application/xml",
    "text/xml",
    "text/plain"
  ],
  limit: "10mb"
});

// B4/B6: GPX file upload (multipart) + public listing
router.post("/upload-gpx", requireAuth, trailController.uploadGpx);
router.get("/public", trailController.listPublicTrails);

router.post("/", requireAuth, trailController.createTrail);
router.get("/", requireAuth, trailController.listTrails);

// B3: geospatial — must come before /:id
router.get("/near", requireAuth, trailController.findNear);
router.get("/bbox", requireAuth, trailController.findInBbox);

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

// B3: elevation graph + GPX/KML import
router.get("/:id/elevation-graph", requireAuth, trailController.getElevationGraph);
router.post("/:id/import/gpx", requireAuth, xmlParser, trailController.importGpx);
router.post("/:id/import/kml", requireAuth, xmlParser, trailController.importKml);

module.exports = router;
