const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Session = require("../models/Session");

// // Signup controller
// exports.signup = async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
//   }

//   const { name, email, password, phone } = req.body;

//   try {
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: "User already exists" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 12);

//     const newUser = new User({
//       name,
//       email,
//       password: hashedPassword,
//       phone,
//     });

//     await newUser.save();

//     res.status(201).json({ message: "User created successfully" });
//   } catch (error) {
//     res.status(500).json({ message: "Something went wrong" });
//   }
// };

// Login controller
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser || existingUser.role === "client") {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { email: existingUser.email, id: existingUser._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );

    const expiresAt = new Date(
      Date.now() + (Number(process.env.JWT_EXPIRES_IN_NUM) || 3600000)
    ); // 1 hour from now
    const session = new Session({
      user: existingUser._id,
      token,
      expiresAt,
    });

    await session.save();

    const userWithoutPassword = existingUser.toObject();
    delete userWithoutPassword.password;

    // Set cookie with token
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None", // Bảo vệ chống lại CSRF
    });

    res.status(200).json({ result: userWithoutPassword, token, expiresAt });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Logout controller
exports.logout = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (token) {
      // Optionally, remove the session from the database
      const session = await Session.findOneAndDelete({ token });
      // Clear the cookie
      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "None", // Bảo vệ chống lại CSRF
      });
    }

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};
// Check token controller
exports.checkToken = async (req, res) => {
  // Nếu authMiddleware đã xác thực token, chỉ cần trả về thông báo thành công
  res.status(200).json({ message: "Token is valid", valid: true });
};
