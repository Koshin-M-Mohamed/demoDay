const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const homeController = require("../controllers/home");
const postsController = require("../controllers/posts");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

//Main Routes - simplified for now
router.get("/", homeController.getIndex);
router.post("/message", homeController.postMessage);
router.get("/recommendations", ensureAuth, postsController.getRecommendations);
router.post("/recommendation", ensureAuth, postsController.postRecommendations);
router.get("/profile", ensureAuth, postsController.getProfile);
router.get("/feed", ensureAuth, postsController.getFeed);
router.get("/login", authController.getLogin);
router.post("/login", authController.postLogin);
router.get("/logout", authController.logout);
router.get("/signup", authController.getSignup);
router.post("/signup", authController.postSignup);
router.get("/:userID", ensureAuth, postsController.getUserPage);
// Follow a user
router.post("/follow/:userId", ensureAuth, authController.followUser);

// Unfollow a user
router.delete("/unfollow/:userId", ensureAuth, authController.unfollowUser);

module.exports = router;
