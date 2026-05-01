const Message = require("../models/message.model");
const groupService = require("./group.service");

const buildError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const parsePage = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) || parsed < 1 ? 1 : parsed;
};

const parseLimit = (value) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    return 20;
  }
  return Math.min(parsed, 100);
};

const sendMessage = async (payload, userId) => {
  const groupId = String(payload.groupId || "").trim();
  const text = String(payload.text || "").trim();

  if (!text) {
    throw buildError("Message text is required", 400);
  }

  const group = await groupService.getGroupById(groupId);

  if (!group.members.includes(userId)) {
    throw buildError("Only group members can send messages", 403);
  }

  const message = await Message.create({
    sender: userId,
    groupId: group._id,
    text
  });

  return message;
};

const getGroupMessages = async (groupId, userId, queryParams) => {
  const page = parsePage(queryParams.page);
  const limit = parseLimit(queryParams.limit);
  const skip = (page - 1) * limit;

  const group = await groupService.getGroupById(groupId);

  if (!group.members.includes(userId)) {
    throw buildError("Only group members can view messages", 403);
  }

  const [messages, total] = await Promise.all([
    Message.find({ groupId: group._id }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Message.countDocuments({ groupId: group._id })
  ]);

  return {
    messages,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1
    }
  };
};

module.exports = {
  sendMessage,
  getGroupMessages
};
