const Chat = require("../models/Chat");

module.exports = {
  // Route to get a specific chat by participants' user IDs
  getChat: async (req, res) => {
    let userId1 = req.params.id.split("-")[0];
    let userId2 = req.params.id.split("-")[1];
    try {
      let chat = await Chat.findOne({
        participants: { $all: [userId1, userId2] },
      }).populate("messages.sender");

      if (!chat) {
        // Create a new chat if it doesn't exist
        chat = new Chat({ participants: [userId1, userId2], messages: [] });
        await chat.save();
      }

      res.render("chatPage", { chat, userId1, userId2 });
    } catch (err) {
      console.log(err);
    }
  },

  // Route to create a new chat
  postChat: async (req, res) => {
    try {
      const { userId1, userId2, message } = req.body;
      let chat = await Chat.findOne({
        participants: { $all: [userId1, userId2] },
      }).populate("messages.sender");

      // Create a new message
      const newMessage = {
        sender: userId1, // Assuming userId1 is the sender
        content: message,
      };

      // Add the message to the chat's messages array
      chat.messages.push(newMessage);

      await chat.save();
      chat = await Chat.findOne({
        participants: { $all: [userId1, userId2] },
      }).populate("messages.sender");

      res.render("chatPage", { chat, userId1, userId2 });
    } catch (err) {
      console.log(err);
    }
  },

  // Route to create a new chat
  deleteChat: async (req, res) => {
    const { chatId, userId1, messageId, userId2 } = req.body;
    console.log("delete: ", chatId, messageId, "users:", userId1, userId2);
    try {
      const chat = await Chat.findById(chatId).populate("messages.sender");

      const message = chat.messages.id(messageId);

      message.remove();
      await chat.save();
      res.render("chatPage", { chat, userId1, userId2 });
    } catch (error) {
      console.error("Error:", error);
      res.render("chatPage", { chat, userId1, userId2 });
    }
  },
};
