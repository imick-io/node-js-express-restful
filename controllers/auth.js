const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const User = require("../models/user");

const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config");

exports.signup = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const error = new Error("Validation failed.");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }

    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({
      email,
      name,
      password: hashedPassword,
    });
    const response = await user.save();

    res.status(201).json({ message: "User created!", userId: response._id });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error("The email or password is incorrect.");
      error.statusCode = 401;
      throw error;
    }
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error("The email or password is incorrect.");
      error.statusCode = 401;
      throw error;
    }

    const userId = user._id.toString();

    const token = jwt.sign(
      {
        email: user.email,
        userId,
      },
      jwtSecret,
      { expiresIn: "1h" }
    );
    res.status(200).json({ token, userId: userId, message: "User logged in!" });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
