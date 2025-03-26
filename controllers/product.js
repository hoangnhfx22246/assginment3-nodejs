const { validationResult } = require("express-validator");
const Product = require("../models/Product");
const fs = require("fs");
const path = require("path");

exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
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
exports.postProduct = async (req, res, next) => {
  try {
    // Lấy dữ liệu từ body
    const { name, category, long_desc, short_desc, price, quantity } = req.body;

    // Kiểm tra nếu không có file nào được upload
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one image is required" });
    }

    // Lấy đường dẫn file ảnh
    const imagePaths = req.files.map((file) => file.path);

    // Tạo sản phẩm mới
    const newProduct = new Product({
      name,
      category,
      long_desc,
      short_desc,
      price,
      images: imagePaths, // Lưu đường dẫn ảnh
      quantity,
    });

    await newProduct.save();

    res
      .status(201)
      .json({ message: "Product created successfully", result: newProduct });
  } catch (error) {
    console.error("Error creating product:", error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};
exports.updateProduct = async (req, res, next) => {
  try {
    const idProduct = req.params.id;

    // Tìm sản phẩm theo ID
    const product = await Product.findById(idProduct);

    // Nếu không tìm thấy sản phẩm
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Lấy dữ liệu từ body
    const { name, category, long_desc, short_desc, price, quantity } = req.body;

    // Nếu có file ảnh mới được upload, xóa ảnh cũ
    if (req.files && req.files.length > 0) {
      const oldImagePaths = product.images; // Ảnh cũ
      oldImagePaths.forEach((imagePath) => {
        const fullPath = path.join(__dirname, "..", imagePath); // Tạo đường dẫn đầy đủ
        fs.unlink(fullPath, (err) => {
          if (err) {
            console.error(`Error deleting file ${fullPath}:`, err.message);
          }
        });
      });

      // Lấy đường dẫn ảnh mới
      const newImagePaths = req.files.map((file) => file.path);
      product.images = newImagePaths; // Cập nhật ảnh mới
    }

    // Cập nhật các trường khác
    if (name) product.name = name;
    if (category) product.category = category;
    if (long_desc) product.long_desc = long_desc;
    if (short_desc) product.short_desc = short_desc;
    if (price) product.price = price;
    if (quantity) product.quantity = quantity;

    // Lưu sản phẩm đã cập nhật
    await product.save();

    res
      .status(200)
      .json({ message: "Product updated successfully", result: product });
  } catch (error) {
    console.error("Error updating product:", error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};
// delete Product
exports.deleteProduct = async (req, res, next) => {
  try {
    const idProduct = req.params.id;

    // Tìm sản phẩm theo ID
    const product = await Product.findById(idProduct);

    // Nếu không tìm thấy sản phẩm
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Xóa các file ảnh trong thư mục uploads
    const imagePaths = product.images; // Mảng chứa đường dẫn ảnh
    imagePaths.forEach((imagePath) => {
      const fullPath = path.join(__dirname, "..", imagePath); // Tạo đường dẫn đầy đủ
      fs.unlink(fullPath, (err) => {
        if (err) {
          console.error(`Error deleting file ${fullPath}:`, err.message);
        }
      });
    });

    // Xóa sản phẩm khỏi cơ sở dữ liệu
    await Product.findByIdAndDelete(idProduct);

    res
      .status(200)
      .json({ message: "Product and associated images deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};
