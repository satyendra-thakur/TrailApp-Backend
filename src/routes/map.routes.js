const express = require("express");
const mapController = require("../controllers/map.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/layers", requireAuth, mapController.getLayersNear);

router.post("/homestays", requireAuth, mapController.createHomestay);
router.get("/homestays", requireAuth, mapController.listHomestaysNear);

router.post("/danger-zones", requireAuth, mapController.createDangerZone);
router.get("/danger-zones", requireAuth, mapController.listDangerZonesNear);

router.post("/water-points", requireAuth, mapController.createWaterPoint);
router.get("/water-points", requireAuth, mapController.listWaterPointsNear);

module.exports = router;
