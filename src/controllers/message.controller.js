const messageService = require("../services/message.service");
const { getIo } = require("../socket");

const sendMessage = async (req, res, next) => {
  try {
    const message = await messageService.sendMessage(
      {
        groupId: req.params.groupId,
        text: req.body.text
      },
      req.user.id
    );

    const io = getIo();
    if (io) {
      io.to(`group:${String(message.groupId)}`).emit("message:new", message);
    }

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    next(error);
  }
};

const getGroupMessages = async (req, res, next) => {
  try {
    const result = await messageService.getGroupMessages(req.params.groupId, req.user.id, req.query);
    res.status(200).json({ success: true, data: result.messages, pagination: result.pagination });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendMessage,
  getGroupMessages
};
