const checklistService = require("../services/checklist.service");

const getChecklist = async (req, res, next) => {
  try {
    const checklist = await checklistService.getOrCreateChecklist(
      req.params.trailId,
      req.user.id
    );
    res.status(200).json({ success: true, data: checklist });
  } catch (error) {
    next(error);
  }
};

const replaceItems = async (req, res, next) => {
  try {
    const checklist = await checklistService.replaceItems(
      req.params.trailId,
      req.body.items,
      req.user.id
    );
    res.status(200).json({ success: true, data: checklist });
  } catch (error) {
    next(error);
  }
};

const addItem = async (req, res, next) => {
  try {
    const checklist = await checklistService.addItem(
      req.params.trailId,
      req.body,
      req.user.id
    );
    res.status(201).json({ success: true, data: checklist });
  } catch (error) {
    next(error);
  }
};

const updateItem = async (req, res, next) => {
  try {
    const checklist = await checklistService.updateItem(
      req.params.trailId,
      req.params.itemId,
      req.body,
      req.user.id
    );
    res.status(200).json({ success: true, data: checklist });
  } catch (error) {
    next(error);
  }
};

const removeItem = async (req, res, next) => {
  try {
    const checklist = await checklistService.removeItem(
      req.params.trailId,
      req.params.itemId,
      req.user.id
    );
    res.status(200).json({ success: true, data: checklist });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getChecklist,
  replaceItems,
  addItem,
  updateItem,
  removeItem
};
