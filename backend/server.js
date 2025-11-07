require("dotenv").config();
const fs = require("fs");
const https = require("https");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const connectDB = require("./config/db");
const routes = require("./routes");

const app = express();

app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

connectDB();

app.use("/api", routes);
app.get("/", (req, res) => res.send("API is running..."));

const PORT = process.env.PORT || 5000;

// HTTPS setup
const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, "ssl/key.pem")),
  cert: fs.readFileSync(path.join(__dirname, "ssl/cert.pem"))
};

https.createServer(httpsOptions, app).listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on https://0.0.0.0:${PORT}`);
});
