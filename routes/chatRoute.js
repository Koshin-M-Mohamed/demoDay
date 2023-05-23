const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chat");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

//Post Routes - simplified for now

router.get("/:id", chatController.getChat);
router.post("/chatMessagePost", chatController.postChat);
router.delete("/chatMessageDelete", chatController.deleteChat);

module.exports = router;
