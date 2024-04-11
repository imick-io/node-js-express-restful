exports.get404 = (req, res, next) => {
  res.status(404).json({ message: "Endpoint not found" });
};
