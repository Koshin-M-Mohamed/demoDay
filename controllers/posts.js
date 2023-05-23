const cloudinary = require("../middleware/cloudinary");
const Post = require("../models/Post");
const User = require("../models/User");
const ObjectId = require("mongodb").ObjectID;
const axios = require("axios");

module.exports = {
  getProfile: async (req, res) => {
    try {
      const allUsers = await User.find({ _id: { $ne: req.user._id } });
      const posts = await Post.find().sort({ createdAt: "desc" }).lean();
      res.render("profile.ejs", {
        posts: posts,
        user: req.user,
        allUsers: allUsers,
      });
    } catch (err) {
      console.log(err);
    }
  },

  getFeed: async (req, res) => {
    try {
      const posts = await Post.find().sort({ createdAt: "desc" }).lean();
      res.render("feed.ejs", { posts: posts });
    } catch (err) {
      console.log(err);
    }
  },
  getSettingPage: async (req, res) => {
    try {
      res.render("settings.ejs", { user: req.user });
    } catch (err) {
      console.log(err);
    }
  },
  getUserPage: async (req, res) => {
    try {
      const currentUserPage = await User.findById(req.params.userID);
      const allUsers = await User.find({ _id: { $ne: req.params.userID } });

      const post = await Post.find({ user: ObjectId(req.params.userID) });
      res.render("userPage.ejs", {
        posts: post,
        user: req.user,
        currentUserPage: currentUserPage,
        allUsers,
      });
    } catch (err) {
      console.log(err);
    }
  },
  createPost: async (req, res) => {
    try {
      // Upload image to cloudinary
      let image, cloudinaryId;
      if (req.file != undefined) {
        const result = await cloudinary.uploader.upload(req.file.path);
        image = result.secure_url;
        cloudinaryId = result.public_id;
      } else {
        image = "none";
        cloudinaryId = "none";
      }
      await Post.create({
        image: image,
        cloudinaryId: cloudinaryId,
        postText: req.body.postText,
        email: req.user.email,
        stars: req.body.stars,
        user: req.user.id,
        likes: 0,
        userName: req.user.userName,
        profileImage: req.user.profileImage,
      });
      console.log("Post has been added!");
      res.redirect("/profile");
    } catch (err) {
      console.log(err);
    }
  },
  likePost: async (req, res) => {
    try {
      await Post.findOneAndUpdate(
        { _id: req.params.id },
        {
          $inc: { likes: 1 },
        }
      );
      console.log("Likes +1");
      res.redirect(`/profile`);
    } catch (err) {
      console.log(err);
    }
  },
  deletePost: async (req, res) => {
    try {
      // Find post by id
      let post = await Post.findById({ _id: req.params.id });
      // Delete image from cloudinary
      await cloudinary.uploader.destroy(post.cloudinaryId);
      // Delete post from db
      await Post.remove({ _id: req.params.id });
      console.log("Deleted Post");
      res.redirect("/profile");
    } catch (err) {
      res.redirect("/profile");
    }
  },
  getRecommendations: (req, res) => {
    res.render("recommendations.ejs");
  },
  postRecommendations: async (req, res) => {
    console.log("sent recommendationn post");
    let aiResponse;
    let location = req.body.location;

    try {
      const prompt = `Inquire about travel recommendations for ${location}. interesting places to visit and food to try
      `;

      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",

          messages: [
            { role: "system", content: prompt },
            { role: "user", content: "What are your recommendations?" },
          ],
          max_tokens: 3800,
          temperature: 0.7,
          n: 1,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPEN_AI_KEY}`,
          },
        }
      );

      aiResponse = response.data.choices[0].message.content;
      console.log(aiResponse);
      res.render("recommendations.ejs", { aiResponse });
    } catch (error) {
      console.error("Error generating travel recommendations:");
      throw error;
    }
  },

  deleteAccount: async (req, res) => {
    try {
      await Post.deleteMany({ user: req.user.id });
      // Update followers' following list

      const deletedUser = await User.findByIdAndDelete(req.user.id).populate(
        "following"
      );

      // Remove deletedUser from the following lists of their followers
      await User.updateMany(
        { _id: { $in: deletedUser.followers } },
        { $pull: { following: deletedUser._id } }
      );

      req.session.destroy((err) => {
        if (err)
          console.log(
            "Error : Failed to destroy the session during logout.",
            err
          );
        req.user = null;
        res.redirect("/");
      });
    } catch (err) {
      res.redirect("/");
    }
  },
  changeProfileImage: async (req, res) => {
    try {
      //Upload image to cloudinary
      if (req.file != undefined) {
        const result = await cloudinary.uploader.upload(req.file.path);
        await User.findOneAndUpdate(
          { _id: req.user.id },
          {
            $set: { profileImage: result.secure_url },
          }
        );

        // Update profile image URL in old posts
        await Post.updateMany(
          { user: req.user.id },
          { $set: { profileImage: result.secure_url } }
        );
      } else if (!req.file) {
        req.flash("errors", {
          msg: "File not supported, please try again with JPG, PNG, JPEG",
        });
        return res.redirect("/settings");
      }
      res.redirect(`/settings`);
    } catch (err) {
      console.log(err);
    }
  },
};
