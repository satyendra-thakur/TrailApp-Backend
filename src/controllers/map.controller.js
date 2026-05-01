const mapService = require("../services/map.service");

const wrap = (fn) => async (req, res, next) => {
  try {
    const data = await fn(req);
    res.status(req.method === "POST" ? 201 : 200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createHomestay: wrap((req) => mapService.createHomestay(req.body, req.user.id)),
  listHomestaysNear: wrap((req) => mapService.findHomestaysNear(req.query)),

  createDangerZone: wrap((req) =>
    mapService.createDangerZone(req.body, req.user.id)
  ),
  listDangerZonesNear: wrap((req) => mapService.findDangerZonesNear(req.query)),

  createWaterPoint: wrap((req) =>
    mapService.createWaterPoint(req.body, req.user.id)
  ),
  listWaterPointsNear: wrap((req) => mapService.findWaterPointsNear(req.query)),

  getLayersNear: wrap((req) => mapService.getLayersNear(req.query))
};
