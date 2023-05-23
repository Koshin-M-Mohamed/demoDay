const Message = require("../models/Message");

module.exports = {
  getIndex: (req, res) => {
    res.render("index.ejs");
  },
  postMessage: async (req, res) => {
    console.log(req.body.message);
    console.log(req.body.name);
    console.log(req.body.email);

    try {
      await Message.create({
        name: req.body.name,
        message: req.body.message,
        email: req.body.email,
      });
      console.log("Post has been added!");
      res.render("index.ejs", {
        message:
          "Your message was sent to us successfully. We will get back to you shortly",
      });
    } catch (err) {
      console.log(err);
    }
  },
};
