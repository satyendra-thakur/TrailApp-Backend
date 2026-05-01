const Homestay = require("../models/homestay.model");
const DangerZone = require("../models/dangerzone.model");
const WaterPoint = require("../models/waterpoint.model");

const normalizeText = (value) => String(value || "").trim();

const buildError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const parseLngLat = (q) => {
  const lng = Number(q.lng);
  const lat = Number(q.lat);
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
    throw buildError("Valid lng and lat query params are required", 400);
  }
  return [lng, lat];
};

const parsePoint = (raw, fieldName) => {
  if (!raw || typeof raw !== "object") {
    throw buildError(`${fieldName} is required`, 400);
  }
  const lng = Number(
    Array.isArray(raw.coordinates) ? raw.coordinates[0] : raw.lng
  );
  const lat = Number(
    Array.isArray(raw.coordinates) ? raw.coordinates[1] : raw.lat
  );
  if (
    !Number.isFinite(lng) ||
    !Number.isFinite(lat) ||
    lng < -180 ||
    lng > 180 ||
    lat < -90 ||
    lat > 90
  ) {
    throw buildError(`${fieldName} must contain valid lng/lat`, 400);
  }
  return { type: "Point", coordinates: [lng, lat] };
};

const nearQuery = (Model, locationField, lng, lat, radiusKm, limit) =>
  Model.find({
    [locationField]: {
      $near: {
        $geometry: { type: "Point", coordinates: [lng, lat] },
        $maxDistance: Math.max(0.1, Number(radiusKm) || 25) * 1000
      }
    }
  }).limit(Math.min(200, Number(limit) || 50));

// Homestays
const createHomestay = async (payload, userId) => {
  const name = normalizeText(payload.name);
  if (!name) throw buildError("Homestay name is required", 400);

  return Homestay.create({
    name,
    description: normalizeText(payload.description),
    address: normalizeText(payload.address),
    region: normalizeText(payload.region),
    country: normalizeText(payload.country),
    location: parsePoint(payload.location, "location"),
    pricePerNight: Number(payload.pricePerNight) || 0,
    currency: payload.currency || "NPR",
    capacity: Number(payload.capacity) || 2,
    amenities: Array.isArray(payload.amenities) ? payload.amenities : [],
    photos: Array.isArray(payload.photos) ? payload.photos : [],
    contactPhone: normalizeText(payload.contactPhone),
    trailIds: Array.isArray(payload.trailIds) ? payload.trailIds : [],
    createdBy: userId
  });
};

const findHomestaysNear = (q) => {
  const [lng, lat] = parseLngLat(q);
  return nearQuery(Homestay, "location", lng, lat, q.radiusKm, q.limit);
};

// Danger zones
const createDangerZone = async (payload, userId) => {
  const name = normalizeText(payload.name);
  if (!name) throw buildError("Danger zone name is required", 400);
  if (!payload.geometry || !payload.geometry.type) {
    throw buildError("geometry { type, coordinates } is required", 400);
  }
  if (!["Point", "Polygon"].includes(payload.geometry.type)) {
    throw buildError("geometry.type must be Point or Polygon", 400);
  }

  return DangerZone.create({
    name,
    description: normalizeText(payload.description),
    hazardType: payload.hazardType || "other",
    severity: payload.severity || "moderate",
    geometry: payload.geometry,
    radiusM: Number(payload.radiusM) || 0,
    activeFrom: payload.activeFrom ? new Date(payload.activeFrom) : null,
    activeUntil: payload.activeUntil ? new Date(payload.activeUntil) : null,
    reportedBy: userId
  });
};

const findDangerZonesNear = (q) => {
  const [lng, lat] = parseLngLat(q);
  return nearQuery(DangerZone, "geometry", lng, lat, q.radiusKm, q.limit);
};

// Water points
const createWaterPoint = async (payload, userId) => {
  const name = normalizeText(payload.name);
  if (!name) throw buildError("Water point name is required", 400);

  return WaterPoint.create({
    name,
    description: normalizeText(payload.description),
    sourceType: payload.sourceType || "spring",
    isPotable: Boolean(payload.isPotable),
    isSeasonal: Boolean(payload.isSeasonal),
    location: parsePoint(payload.location, "location"),
    altitudeM:
      payload.altitudeM === undefined || payload.altitudeM === null
        ? null
        : Number(payload.altitudeM),
    lastVerifiedAt: payload.lastVerifiedAt ? new Date(payload.lastVerifiedAt) : null,
    addedBy: userId
  });
};

const findWaterPointsNear = (q) => {
  const [lng, lat] = parseLngLat(q);
  return nearQuery(WaterPoint, "location", lng, lat, q.radiusKm, q.limit);
};

// Combined map layer: returns all 3 layers near a point in one call
const getLayersNear = async (q) => {
  const [lng, lat] = parseLngLat(q);
  const radius = q.radiusKm || 25;
  const [homestays, dangerZones, waterPoints] = await Promise.all([
    nearQuery(Homestay, "location", lng, lat, radius, q.limit),
    nearQuery(DangerZone, "geometry", lng, lat, radius, q.limit),
    nearQuery(WaterPoint, "location", lng, lat, radius, q.limit)
  ]);
  return { center: [lng, lat], radiusKm: Number(radius), homestays, dangerZones, waterPoints };
};

module.exports = {
  createHomestay,
  findHomestaysNear,
  createDangerZone,
  findDangerZonesNear,
  createWaterPoint,
  findWaterPointsNear,
  getLayersNear
};
