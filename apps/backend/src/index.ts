import "dotenv/config";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { corsMiddleware } from "./middleware/cors.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { router } from "./routes/index.js";

const app = express();
const PORT = process.env.PORT ?? 3001;

// ─── Security & Middleware ─────────────────────────────────────────────────────
app.use(helmet());
app.use(corsMiddleware);
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api", router);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "CostLens AI Backend",
  });
});

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 CostLens AI Backend running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV ?? "development"}`);
});

export default app;
