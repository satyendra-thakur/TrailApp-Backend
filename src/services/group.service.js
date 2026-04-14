const crypto = require("crypto");
const mongoose = require("mongoose");
const Group = require("../models/group.model");

const normalizeText = (value) => String(value || "").trim();

const buildError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const generateInviteCode = async () => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = crypto.randomBytes(4).toString("hex").toUpperCase();
    const existing = await Group.exists({ inviteCode: code });
    if (!existing) {
      return code;
    }
  }

  throw buildError("Failed to generate invite code. Please retry.", 500);
};

const createGroup = async (payload, userId) => {
  const name = normalizeText(payload.name);
  const description = normalizeText(payload.description);
  const destination = normalizeText(payload.destination);

  if (!name || name.length < 2) {
    throw buildError("Group name must be at least 2 characters long", 400);
  }

  if (!destination) {
    throw buildError("Destination is required", 400);
  }

  const inviteCode = await generateInviteCode();
  const group = await Group.create({
    name,
    description,
    destination,
    createdBy: userId,
    members: [userId],
    inviteCode
  });

  return group;
};

const joinGroup = async (payload, userId) => {
  const groupId = normalizeText(payload.groupId);
  const inviteCode = normalizeText(payload.inviteCode).toUpperCase();

  if (!groupId && !inviteCode) {
    throw buildError("Either groupId or inviteCode is required", 400);
  }

  const query = {};

  if (groupId) {
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      throw buildError("Invalid groupId", 400);
    }
    query._id = groupId;
  } else {
    query.inviteCode = inviteCode;
  }

  const group = await Group.findOne(query);

  if (!group) {
    throw buildError("Group not found", 404);
  }

  // Prevent duplicate joins and keep membership updates atomic.
  const updatedGroup = await Group.findOneAndUpdate(
    { _id: group._id, members: { $ne: userId } },
    { $addToSet: { members: userId } },
    { new: true }
  );

  if (!updatedGroup) {
    throw buildError("User is already a group member", 409);
  }

  return updatedGroup;
};

const getGroupById = async (groupId) => {
  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    throw buildError("Invalid groupId", 400);
  }

  const group = await Group.findById(groupId);

  if (!group) {
    throw buildError("Group not found", 404);
  }

  return group;
};

module.exports = {
  createGroup,
  joinGroup,
  getGroupById
};
