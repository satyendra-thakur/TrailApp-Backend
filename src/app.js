const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const { notFound, errorHandler } = require("./middlewares/error.middleware");

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = (process.env.CLIENT_WEB_URL || "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);

      // Allow non-browser clients and same-origin requests.
      if (!origin) return callback(null, true);

      // If no explicit allowlist provided, allow all origins in dev.
      if (allowed.length === 0) return callback(null, true);

      if (allowed.includes(origin)) return callback(null, true);
      return callback(new Error("CORS blocked for this origin"));
    },
    credentials: true
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
