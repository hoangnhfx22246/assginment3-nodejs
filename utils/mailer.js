const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOrderConfirmationEmail = (order) => {
  const baseUrl = process.env.BASE_URL; // Lấy URL gốc từ biến môi trường
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: order.email,
    subject: " Order",
    html: `
      <h1>Xin Chào ${order.name}</h1>
      <p>Phone: ${order.phone}</p>
      <p>Address: ${order.address}</p>
      <div style="overflow-x: auto;">
        <table style="border:none; width: 100%; min-width: 700px;">
          <thead>
            <tr>
              <th style="border: 1px solid #ccc">Tên Sản Phẩm</th>
              <th style="border: 1px solid #ccc; width:85px">Hình Ảnh</th>
              <th style="border: 1px solid #ccc">Giá</th>
              <th style="border: 1px solid #ccc; width:65px">Số Lượng</th>
              <th style="border: 1px solid #ccc">Thành Tiền</th>
            </tr>
          </thead>
          <tbody>
            ${order.carts
              .map(
                (cart) => `
              <tr style="text-align:center">
                <td style="border: 1px solid #ccc">${cart.product.name}</td>
                <td style="border: 1px solid #ccc"><img src="${baseUrl}/${
                  cart.product.img
                }" alt="${cart.product.name}" style="width: 100%"></td>
                <td style="border: 1px solid #ccc">${
                  Number(cart.product.price).toLocaleString() + " VND"
                }</td>
                <td style="border: 1px solid #ccc">${cart.quantity}</td>
                <td style="border: 1px solid #ccc">${
                  Number(cart.product.price * cart.quantity).toLocaleString() +
                  " VND"
                }</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>
      <h2>Tổng Thanh Toán</h2>
      <h2>${Number(order.totalAmount).toLocaleString() + " VND"}</h2>
      <h2>Cảm ơn bạn!</h2>
      <p>Đơn hàng được đặt vào: ${new Date(
        order.createdAt
      ).toLocaleString()}</p>
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error sending email: ", error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

module.exports = sendOrderConfirmationEmail;
