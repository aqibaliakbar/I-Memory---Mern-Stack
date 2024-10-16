require("dotenv").config();
const connectToMongo = require("./db");
const express = require("express");
const cors = require("cors");
connectToMongo();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Availiable Routes

app.use("/api/auth", require("./routes/auth.js"));
app.use("/api/notes", require("./routes/notes.js"));

app.get("/", (req, res) => {
  res.send("Hello Aqib!");
});

app.listen(port, () => {
  console.log(`Note Memory backend listening on port http://localhost:${port}`);
});
