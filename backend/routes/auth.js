const express = require("express");
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetchuser = require("../middleware/fetchuser");

// ================================ ROUTE 1 -create a User using: POST "/api/auth/createuser". (Login Not Required) ==================================//

router.post(
  "/createuser",
  [
    body("name", "Enter a Valid Name").isLength({ min: 3 }),
    body("email", "Enter a Valid Email").isEmail(),
    body("password", "Password must be atleast 5 characters").isLength({
      min: 5,
    }),
  ],

  async (req, res) => {
    let success = false;
    // If there are errors, return bad request and return the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }

    // Check wether user with email already exist in our database

    try {
      let user = await User.findOne({ email: req.body.email });

      if (user) {
        return res
          .status(400)
          .json({
            success,
            error:
              "Please enter a unique value for email as this email already exist",
          });
      }

      // we created our user password hash + salt by creating const salt and securePassword
      const salt = await bcrypt.genSaltSync(10);
      const securePassword = await bcrypt.hash(req.body.password, salt);

      // Create a new user
      let userPerson = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: securePassword,
      });

      const data = {
        userPerson: {
          id: userPerson.id,
        },
      };

      const JWT_SECRET = "Aqibswork357";

      const authToken = jwt.sign(data, JWT_SECRET);

      success = true;
      res.json({ success, authToken });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ error: "Internal Server error" });
    }
  }
);

// =========================== ROUTE 2 -Authenticate a User using: POST "/api/auth/login". (Login Not Required)==================================//

// First we check for valid email if email is not valid we will not bother server or send it to server.

router.post(
  "/login",
  [
    body("email", "Enter a Valid Email").isEmail(),
    body("password", "Password Cannot be blank").exists(),
  ],
  async (req, res) => {
    let success = false;
    // If there are errors, return bad request and return the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }

    // Now we check wether user email exist in our database or not

    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ errors: "Please try to login with correct credentials" });
      }

      const passwordCompare = await bcrypt.compare(password, user.password);
      console.log(user.password);
      if (!passwordCompare) {
        success = false;
        return res
          .status(400)
          .json({
            success,
            errors: "Please try to login with correct credentials",
          });
      }

      const data = {
        user: {
          id: user.id,
        },
      };

      const JWT_SECRET = "Aqibswork357";

      const authToken = jwt.sign(data, JWT_SECRET);
      success = true;
      res.json({ success, authToken });
      //res.json(userPerson);
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ error: "Internal Server error" });
    }
  }
);

// ======================= ROUTE 3 - Get Logged In User Details using: POST "/api/auth/getuser". (Login Required)====================================//

router.post("/getuser", fetchuser, async (req, res) => {
  try {
    let userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.send(user);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal Server error" });
  }
});

module.exports = router;
