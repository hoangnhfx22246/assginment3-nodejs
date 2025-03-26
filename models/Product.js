// filepath: /Users/liggg/Desktop/Công việc của hoàng/web/funix - khóa học/nodejs/lab/Assignment03/models/Product.js
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    images: [{ type: String, required: true }],
    long_desc: {
      type: String,
      required: true,
    },
    short_desc: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
