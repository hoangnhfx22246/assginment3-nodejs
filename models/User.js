const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      require: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    orders: [
      {
        type: Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
    role: {
      type: String,
      enum: ["client", "admin", "advisor"],
      default: "client",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
