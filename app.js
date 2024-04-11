const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");
const crypto = require("crypto");

const feedRoutes = require("./routes/feed");
const authRoutes = require("./routes/auth");
const errorController = require("./controllers/error");
const { mongoUri } = require("./config");

const app = express();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "images");
  },
  filename: function (req, file, cb) {
    cb(null, crypto.randomUUID());
  },
});

const fileFilter = (req, file, cb) => {
  cb(null, ["image/png", "image/jpg", "image/jpeg"].includes(file.mimetype));
};

app.use(bodyParser.json());
app.use(multer({ storage, fileFilter }).single("image"));
app.use("/images", express.static(path.join(__dirname, "images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/feed", feedRoutes);
app.use("/auth", authRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message || "An error occurred.";
  const data = error.data;
  res.status(status).json({ message, data });
});

app.use(errorController.get404);

mongoose
  .connect(mongoUri)
  .then((result) => {
    app.listen(8080);
  })
  .catch((err) => console.log(err));
