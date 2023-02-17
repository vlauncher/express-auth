var express = require("express");
var router = express.Router();
const passport = require("passport");
const Profile = require("../models/profile");
const User = require("../models/users");
const crypto = require("crypto");
const nodemailer = require('nodemailer');
const { ensureAuthenticated } = require("../middlewares/auth");


const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});



/* GET Register Page */
router.get("/register", function (req, res, next) {
  if (req.user) {
    res.redirect("/");
  } else {
    res.render("users/register");
  }
});

/* Handle Registeration */
router.post("/register", async function (req, res, next) {
  const { first_name, last_name, email, password, re_password } = req.body;
  let errors = [];
  try {
    // Check required fields
    if (!(first_name || last_name || email || password || re_password)) {
      errors.push({ msg: "Please fill in all fields." });
    }
    // check Passwords
    if (password !== re_password) {
      errors.push({ msg: "Passwords do not match" });
    }
    // Check password length
    if (password.length < 6) {
      errors.push({ msg: "Passwords should be atleast 6 characters" });
    }
    if (errors.length > 0) {
      res.render("users/register", {
        errors,
        first_name,
        last_name,
        email,
        password,
        re_password,
      });
    }
    // Check user exists
    const userExists = await User.findOne({ where: { email: email } });
    if (userExists) {
      errors.push({ msg: "Email Already Exists" });
      res.render("users/register", {
        errors,
        first_name,
        last_name,
        email,
        password,
        re_password,
      });
    } else {
      const verificationToken = crypto.randomBytes(20).toString("hex");
      console.log(verificationToken)

      const user = await User.create({
        first_name,
        last_name,
        email,
        password,
        verificationToken:verificationToken
      }).then((usercreated) => {
        Profile.create({ UserId: usercreated.id });
        const mailOptions = {
          from: "youremail@gmail.com",
          to: email,
          subject: "Email Verification",
          html: `<p>Please click on the following link to verify your email: <a href="http://localhost:3000/verify/${verificationToken}">http://localhost:3000/verify/${verificationToken}</a></p>`,
        };
        transporter.sendMail(mailOptions, (err, info) => {
          if (err) {
            console.log(err);
          } else {
            console.log(`Email sent: ${info.response}`);
            req.flash(
              "success",
              "An email has been sent to your email address for verification."
            );
            res.redirect("/users/login");
          }
        });
      });
    }
  } catch (error) {
    errors.push({ msg: error });
    res.render("users/register", {
      errors,
      first_name,
      last_name,
      email,
      password,
      re_password,
    });
  }
});

/* Verify token */
router.get("/verify/:token", (req, res) => {
  const verificationToken = req.params.token;

  User.findOne({ where: { verificationToken } })
    .then((user) => {
      if (user) {
        user
          .update({ verified: true, verificationToken: null })
          .then(() => {
            req.flash("success", "Your email has been verified.");
            res.redirect("/users/login");
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        req.flash("error", "Invalid verification token.");
        res.redirect("/users/login");
      }
    })
    .catch((err) => {
      console.log(err);
    });
});


router.get('/change-password', ensureAuthenticated, (req, res) => {
  res.render('users/change-password', { user: req.user });
});

/* Change Password */
router.post('/change-password', ensureAuthenticated, (req, res) => {
  const { currentPassword, newPassword } = req.body;

  User.findOne({ where: { id: req.user.id } }).then((user) => {
    if (!user) {
      req.flash('error', 'User not found.');
      res.redirect('/users/change-password');
      return;
    }

    // Check if the current password is correct
    user.comparePassword(currentPassword, (err, isMatch) => {
      if (err) {
        console.log(err);
        req.flash('error', 'An error occurred. Please try again later.');
        res.redirect('/users/change-password');
        return;
      }

      if (!isMatch) {
        req.flash('error', 'Incorrect password.');
        res.redirect('/users/change-password');
        return;
      }

      // Change the password
      user.password = newPassword;
      user.save((err) => {
        if (err) {
          console.log(err);
          req.flash('error', 'An error occurred. Please try again later.');
          res.redirect('/users/change-password');
        } else {
          req.flash('success', 'Your password has been changed.');
          res.redirect('/');
        }
      });
    });
  }).catch((err) => {
    console.log(err);
    req.flash('error', 'An error occurred. Please try again later.');
    res.redirect('/change-password');
  });
});


/* GET Login Page */
router.get("/login", function (req, res, next) {
  if (req.user) {
    res.redirect("/");
  } else {
    res.render("users/login");
  }
});

/* Handle Login */
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/users/login",
    failureFlash: true,
  })(req, res, next);
});

// Get Profile
router.get("/profile", (req, res) => {
  User.findByPk(req.user, { include: Profile }).then((user) => {
    res.render("profile/dashboard", { user });
  });
});

/* GET Logout Page */
router.get("/logout", function (req, res, next) {
  res.render("users/logout");
});

/* Handle lOGOUT  */
router.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success_msg", "Logout Success");
    res.redirect("/users/login");
  });
});

module.exports = router;
