const passport = require("passport");
const validator = require("validator");
const User = require("../models/User");

exports.getLogin = (req, res) => {
  if (req.user) {
    return res.redirect("/profile");
  }
  res.render("login", {
    title: "Login",
  });
};

exports.postLogin = (req, res, next) => {
  const validationErrors = [];
  if (!validator.isEmail(req.body.email))
    validationErrors.push({ msg: "Please enter a valid email address." });
  if (validator.isEmpty(req.body.password))
    validationErrors.push({ msg: "Password cannot be blank." });

  if (validationErrors.length) {
    req.flash("errors", validationErrors);
    return res.redirect("/login");
  }
  req.body.email = validator.normalizeEmail(req.body.email, {
    gmail_remove_dots: false,
  });

  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      req.flash("errors", info);
      return res.redirect("/login");
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", { msg: "Success! You are logged in." });
      res.redirect(req.session.returnTo || "/profile");
    });
  })(req, res, next);
};

exports.logout = (req, res) => {
  req.logout(() => {
    console.log("User has logged out.");
  });
  req.session.destroy((err) => {
    if (err)
      console.log("Error : Failed to destroy the session during logout.", err);
    req.user = null;
    res.redirect("/");
  });
};

exports.getSignup = (req, res) => {
  if (req.user) {
    return res.redirect("/profile");
  }
  res.render("signup", {
    title: "Create Account",
  });
};

exports.postSignup = (req, res, next) => {
  const validationErrors = [];
  if (!validator.isEmail(req.body.email))
    validationErrors.push({ msg: "Please enter a valid email address." });
  if (!validator.isLength(req.body.password, { min: 8 }))
    validationErrors.push({
      msg: "Password must be at least 8 characters long",
    });
  if (req.body.password !== req.body.confirmPassword)
    validationErrors.push({ msg: "Passwords do not match" });

  if (validationErrors.length) {
    req.flash("errors", validationErrors);
    return res.redirect("../signup");
  }
  req.body.email = validator.normalizeEmail(req.body.email, {
    gmail_remove_dots: false,
  });
  let arr = [
    "https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg?auto=compress&cs=tinysrgb&w=1600",
    "https://images.pexels.com/photos/2190283/pexels-photo-2190283.jpeg?auto=compress&cs=tinysrgb&w=1600",
    "https://images.pexels.com/photos/2675268/pexels-photo-2675268.jpeg?auto=compress&cs=tinysrgb&w=1600",
    "https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=1600",
    "https://images.pexels.com/photos/2193300/pexels-photo-2193300.jpeg?auto=compress&cs=tinysrgb&w=1600",
    "https://images.pexels.com/photos/2387871/pexels-photo-2387871.jpeg?auto=compress&cs=tinysrgb&w=1600",
    "https://images.pexels.com/photos/3780224/pexels-photo-3780224.jpeg?auto=compress&cs=tinysrgb&w=1600",
    "https://images.pexels.com/photos/3018977/pexels-photo-3018977.jpeg?auto=compress&cs=tinysrgb&w=1600",
    "https://images.pexels.com/photos/8285167/pexels-photo-8285167.jpeg?auto=compress&cs=tinysrgb&w=1600",
    "https://images.pexels.com/photos/3722817/pexels-photo-3722817.jpeg?auto=compress&cs=tinysrgb&w=1600",
    "https://images.pexels.com/photos/3779837/pexels-photo-3779837.jpeg?auto=compress&cs=tinysrgb&w=1600",
    "https://images.pexels.com/photos/3322315/pexels-photo-3322315.jpeg?auto=compress&cs=tinysrgb&w=1600",
    "https://www.goway.com/media/cache/dc/f1/dcf1a366d11dcdbbc2ca60d20b2fe7be.jpg",
  ];

  const user = new User({
    userName: req.body.userName,
    email: req.body.email,
    password: req.body.password,
    profileImage: arr[Math.floor(Math.random() * 13)],
    cloudinaryId: "",
  });

  User.findOne(
    { $or: [{ email: req.body.email }, { userName: req.body.userName }] },
    (err, existingUser) => {
      if (err) {
        return next(err);
      }
      if (existingUser) {
        req.flash("errors", {
          msg: "Account with that email address or username already exists.",
        });
        return res.redirect("../signup");
      }
      user.save((err) => {
        if (err) {
          return next(err);
        }
        req.logIn(user, (err) => {
          if (err) {
            return next(err);
          }
          res.redirect("/profile");
        });
      });
    }
  );
};

(exports.followUser = async (req, res) => {
  try {
    const userToFollowId = req.params.userId;
    const currentUser = req.user;

    if (!currentUser) {
      // Handle unauthorized access
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Find the user to follow
    const userToFollow = await User.findById(userToFollowId);

    if (!userToFollow) {
      // Handle user not found
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the current user is already following the target user
    const isFollowing = userToFollow.followers.includes(currentUser._id);

    if (isFollowing) {
      // User is already being followed, so unfollow them
      userToFollow.followers.pull(currentUser._id);
      currentUser.following.pull(userToFollowId);
    } else {
      // User is not being followed, so follow them
      userToFollow.followers.push(currentUser._id);
      currentUser.following.push(userToFollowId);
    }

    // Save the changes
    await userToFollow.save();
    await currentUser.save();

    res.redirect(`/${userToFollowId}`);
  } catch (err) {
    console.log(err);
    res.redirect("/"); // Handle the error as desired
  }
}),
  (exports.unfollowUser = async (req, res) => {
    try {
      const userToUnfollowId = req.params.userId;
      const currentUser = req.user;

      if (!currentUser) {
        // Handle unauthorized access
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Find the user to unfollow
      const userToUnfollow = await User.findById(userToUnfollowId);

      if (!userToUnfollow) {
        // Handle user not found
        return res.status(404).json({ error: "User not found" });
      }

      // Check if the current user is already following the target user
      const isFollowing = userToUnfollow.followers.includes(currentUser._id);

      if (isFollowing) {
        // User is being followed, so unfollow them
        userToUnfollow.followers.pull(currentUser._id);
        currentUser.following.pull(userToUnfollowId);

        // Save the changes
        await userToUnfollow.save();
        await currentUser.save();
      }

      res.redirect(`/${userToUnfollowId}`);
    } catch (err) {
      console.log(err);
      res.redirect("/"); // Handle the error as desired
    }
  });
