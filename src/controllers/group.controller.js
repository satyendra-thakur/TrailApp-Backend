const groupService = require("../services/group.service");

const createGroup = async (req, res, next) => {
  try {
    const group = await groupService.createGroup(req.body, req.user.id);
    res.status(201).json({ success: true, data: group });
  } catch (error) {
    next(error);
  }
};

const joinGroup = async (req, res, next) => {
  try {
    const group = await groupService.joinGroup(req.body, req.user.id);
    res.status(200).json({ success: true, data: group });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createGroup,
  joinGroup
};
