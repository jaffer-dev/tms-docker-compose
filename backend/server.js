app.use(morgan("dev"));

// ✅ Explicitly allow your frontend’s HTTPS origin
const corsOptions = {
  origin: ["https://10.10.5.108:8443"], // your frontend URL
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

// Handle preflight requests properly
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
