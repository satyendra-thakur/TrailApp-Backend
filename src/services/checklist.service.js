const mongoose = require("mongoose");
const Checklist = require("../models/checklist.model");
const Trail = require("../models/trail.model");

const normalizeText = (value) => String(value || "").trim();

const buildError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const ensureObjectId = (id, label = "id") => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw buildError(`Invalid ${label}`, 400);
  }
};

const DEFAULT_TEMPLATES = {
  easy: [
    { name: "Water bottle (1L)", category: "water", isEssential: true },
    { name: "Snacks", category: "food" },
    { name: "Sunscreen", category: "medical" },
    { name: "Phone + charger", category: "navigation", isEssential: true },
    { name: "Light jacket", category: "clothing" }
  ],
  moderate: [
    { name: "Water (2L)", category: "water", isEssential: true },
    { name: "Packed lunch", category: "food", isEssential: true },
    { name: "Map / offline GPS", category: "navigation", isEssential: true },
    { name: "First aid kit", category: "medical", isEssential: true },
    { name: "Rain jacket", category: "clothing" },
    { name: "Headlamp", category: "gear" },
    { name: "Hiking boots", category: "gear", isEssential: true }
  ],
  hard: [
    { name: "Water (3L+) + filter", category: "water", isEssential: true },
    { name: "High-energy meals", category: "food", isEssential: true },
    { name: "Topographic map + compass", category: "navigation", isEssential: true },
    { name: "Full first aid kit", category: "medical", isEssential: true },
    { name: "Emergency shelter/bivy", category: "shelter", isEssential: true },
    { name: "Thermal layers", category: "clothing", isEssential: true },
    { name: "Headlamp + spare batteries", category: "gear", isEssential: true },
    { name: "ID & permits", category: "documents", isEssential: true }
  ],
  expert: [
    { name: "Water (4L+) + purification", category: "water", isEssential: true },
    { name: "Multi-day rations", category: "food", isEssential: true },
    { name: "GPS + map + compass", category: "navigation", isEssential: true },
    { name: "Advanced first aid + meds", category: "medical", isEssential: true },
    { name: "Tent or bivouac", category: "shelter", isEssential: true },
    { name: "Cold-weather system", category: "clothing", isEssential: true },
    { name: "Technical gear (ropes/crampons)", category: "gear", isEssential: true },
    { name: "Satellite communicator", category: "gear", isEssential: true },
    { name: "ID, permits, insurance", category: "documents", isEssential: true }
  ]
};

const sanitizeItem = (raw) => {
  if (!raw || typeof raw !== "object") {
    throw buildError("Each item must be an object", 400);
  }
  const name = normalizeText(raw.name);
  if (!name) {
    throw buildError("Item name is required", 400);
  }
  return {
    name,
    category: raw.category || "gear",
    quantity: Number.isFinite(Number(raw.quantity)) ? Number(raw.quantity) : 1,
    isEssential: Boolean(raw.isEssential),
    isChecked: Boolean(raw.isChecked),
    notes: normalizeText(raw.notes)
  };
};

const getOrCreateChecklist = async (trailId, userId) => {
  ensureObjectId(trailId, "trailId");

  const trail = await Trail.findById(trailId);
  if (!trail) {
    throw buildError("Trail not found", 404);
  }
  if (trail.createdBy !== userId) {
    throw buildError("Forbidden: you do not own this trail", 403);
  }

  let checklist = await Checklist.findOne({ trailId, createdBy: userId });
  if (checklist) return checklist;

  const template = DEFAULT_TEMPLATES[trail.difficulty] || DEFAULT_TEMPLATES.moderate;
  checklist = await Checklist.create({
    trailId,
    createdBy: userId,
    items: template.map(sanitizeItem)
  });
  return checklist;
};

const getChecklist = async (trailId, userId) => {
  ensureObjectId(trailId, "trailId");
  const checklist = await Checklist.findOne({ trailId, createdBy: userId });
  if (!checklist) {
    throw buildError("Checklist not found", 404);
  }
  return checklist;
};

const replaceItems = async (trailId, items, userId) => {
  if (!Array.isArray(items)) {
    throw buildError("items must be an array", 400);
  }
  const checklist = await getOrCreateChecklist(trailId, userId);
  checklist.items = items.map(sanitizeItem);
  await checklist.save();
  return checklist;
};

const addItem = async (trailId, payload, userId) => {
  const checklist = await getOrCreateChecklist(trailId, userId);
  checklist.items.push(sanitizeItem(payload));
  await checklist.save();
  return checklist;
};

const updateItem = async (trailId, itemId, payload, userId) => {
  ensureObjectId(itemId, "itemId");
  const checklist = await getChecklist(trailId, userId);
  const item = checklist.items.id(itemId);
  if (!item) {
    throw buildError("Item not found", 404);
  }

  if (payload.name !== undefined) {
    const name = normalizeText(payload.name);
    if (!name) throw buildError("Item name cannot be empty", 400);
    item.name = name;
  }
  if (payload.category !== undefined) item.category = payload.category;
  if (payload.quantity !== undefined) item.quantity = Number(payload.quantity);
  if (payload.isEssential !== undefined) item.isEssential = Boolean(payload.isEssential);
  if (payload.isChecked !== undefined) item.isChecked = Boolean(payload.isChecked);
  if (payload.notes !== undefined) item.notes = normalizeText(payload.notes);

  await checklist.save();
  return checklist;
};

const removeItem = async (trailId, itemId, userId) => {
  ensureObjectId(itemId, "itemId");
  const checklist = await getChecklist(trailId, userId);

  const before = checklist.items.length;
  checklist.items = checklist.items.filter(
    (i) => String(i._id) !== String(itemId)
  );
  if (checklist.items.length === before) {
    throw buildError("Item not found", 404);
  }
  await checklist.save();
  return checklist;
};

module.exports = {
  getOrCreateChecklist,
  getChecklist,
  replaceItems,
  addItem,
  updateItem,
  removeItem
};
