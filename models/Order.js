const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const orderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    carts: [
      {
        product: {
          id: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true,
          },
          img: {
            type: String,
            required: true,
          },
          name: {
            type: String,
            required: true,
          },
          price: {
            type: Number,
            required: true,
          },
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    delivery: {
      type: String,
      enum: ["Chưa vận chuyển", "Đã vận chuyển"],
      default: "Chưa vận chuyển",
    },
    status: {
      type: String,
      enum: ["Chưa thanh toán", "Đã Thanh toán", "Đã hủy"],
      default: "Chưa thanh toán",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
