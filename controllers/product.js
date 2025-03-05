const Product = require("../models/Product");

exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find();
    return res.status(200).json({ result: products });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};
exports.getProduct = async (req, res, next) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ result: product });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};
