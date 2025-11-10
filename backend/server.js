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

// ===== MIDDLEWARE =====

// Logging
app.use(morgan("dev"));

// CORS - allow only frontend domain (set in .env)
const FRONTEND_URL = 'https://10.10.5.105:8443' || "http://localhost:3000";
app.use(cors({
  origin: FRONTEND_URL,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

// JSON body parser
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// ===== DATABASE =====
connectDB();

// ===== ROUTES =====
app.use("/api", routes);
app.get("/", (req, res) => res.send("API is running..."));

// ===== HTTPS SETUP =====
const PORT = process.env.PORT || 5000;

let server;

try {
  const httpsOptions = {
    key: fs.readFileSync(path.join(__dirname, "ssl/key.pem")),
    cert: fs.readFileSync(path.join(__dirname, "ssl/cert.pem")),
  };

  server = https.createServer(httpsOptions, app);
} catch (err) {
  console.error("SSL certificates not found or invalid. Falling back to HTTP.");
  server = app; // fallback to HTTP if SSL fails
}

// ===== START SERVER =====
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT} (HTTPS if certificates found)`);
});

// ===== OPTIONAL: Log incoming requests for debugging =====
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl}`, req.headers.authorization || "");
  next();
});
