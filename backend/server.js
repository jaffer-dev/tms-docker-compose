require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const connectDB = require("./config/db");
const routes = require("./routes");

const app = express();

app.use(morgan("dev"));
app.options("*", cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

connectDB();

app.use("/api", routes);
app.get("/", (req, res) => res.send("API is running..."));

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`Server running on port ${PORT}`)
);
