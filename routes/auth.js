const express = require("express");
const { body } = require("express-validator");

const router = express.Router();

const User = require("../models/user");

const authController = require("../controllers/auth");

router.put(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom(async (value, { req }) => {
        const userDoc = await User.findOne({ email: value });
        if (userDoc) {
          return Promise.reject("E-Mail address already exists!");
        }
        return true;
      })
      .normalizeEmail(),
    body("password").trim().isLength({ min: 5 }),
    body("name").trim().not().isEmpty(),
  ],
  authController.signup
);

router.post(
  "/login",
  [
    body("email")
      .normalizeEmail()
      .isEmail()
      .withMessage("Please enter a valid email."),
    body("password").trim().isLength({ min: 5 }),
  ],
  authController.login
);

module.exports = router;
