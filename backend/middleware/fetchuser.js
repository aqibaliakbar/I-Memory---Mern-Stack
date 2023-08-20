const jwt = require("jsonwebtoken");
const JWT_SECRET = "Aqibswork357"; // Although we need to keep our signature in .env.local enviroment variable so it cant be accessed by anyone. But for now we are using it here.

const fetchuser = (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) {
    res.status(401).send({ error: "Please authenticate using a valid token" });
  }

  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.user = data.user;
    next();
  } catch (error) {
    res.status(401).send({ error: "Please authenticate using a valid token" });
  }
};

module.exports = fetchuser;
