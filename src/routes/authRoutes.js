const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const supabaseService = require("../services/supabaseService");
const { infoLogger, errorLogger } = require("../logger");
const { createClient } = require("@supabase/supabase-js");

const validateCredentials = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

const supabase = supabaseService;

router.post("/login", validateCredentials, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const { email, password } = req.body;

  try {
    const { data, error } = await createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY,
    ).auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ message: error.message });
    }

    infoLogger("Credentials verified successfully. Logging in...");
    res
      .cookie("auth", data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
      })
      .json({
        success: true,
        message: "Credentials verified successfully",
      });
  } catch (error) {
    errorLogger("Error during credential verification:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying credentials",
    });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("auth");
  res.json({ success: true, message: "Logged out successfully" });
});

router.get("/get-user-details", async (req, res) => {
  const { data, error } = await createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
  ).auth.getUser(req.cookies.auth);
  if (error) {
    return res.status(401).json({ message: error.message });
  }
  res.json({
    success: true,
    message: "User details fetched successfully",
    data,
  });
});

module.exports = router;
