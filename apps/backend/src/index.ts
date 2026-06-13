import "dotenv/config";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { corsMiddleware } from "./middleware/cors.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { router } from "./routes/index.js";
import { prisma } from "./config/database.js";

const app = express();
const PORT = process.env.PORT ?? 3001;

function loadSwaggerSpec() {
  const workspaceSpecPath = resolve(
    process.cwd(),
    "src",
    "docs",
    "swagger.json",
  );
  const monorepoSpecPath = resolve(
    process.cwd(),
    "apps",
    "backend",
    "src",
    "docs",
    "swagger.json",
  );

  try {
    return JSON.parse(readFileSync(workspaceSpecPath, "utf-8"));
  } catch {
    return JSON.parse(readFileSync(monorepoSpecPath, "utf-8"));
  }
}

const swaggerSpec = loadSwaggerSpec();

// Keep Swagger UI before helmet to avoid CSP issues with the UI assets.
// Only serve Swagger in development to avoid serverless cold-start issues.
if (process.env.NODE_ENV !== "production") {
  app.get("/api-docs/swagger.json", (_req, res) => {
    res.json(swaggerSpec);
  });
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// ─── Security & Middleware ─────────────────────────────────────────────────────
app.use(helmet());
app.use(corsMiddleware);
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api", router);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "CostLens AI Backend",
      database: "connected",
    });
  } catch (error) {
    console.error("❌ Health check failed:", error);
    res.status(503).json({
      status: "error",
      database: "disconnected",
      message:
        error instanceof Error ? error.message : "Database connection failed",
    });
  }
});

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 CostLens AI Backend running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV ?? "development"}`);
});

export default app;
