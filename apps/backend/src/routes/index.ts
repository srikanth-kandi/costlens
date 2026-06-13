import { Router } from "express";
import { dashboardRouter } from "./dashboard.routes.js";
import { projectsRouter } from "./projects.routes.js";
import { meetingsRouter } from "./meetings.routes.js";
import { anomaliesRouter } from "./anomalies.routes.js";
import { attributionRouter } from "./attribution.routes.js";
import { calculateCost } from "../controllers/attribution.controller.js";

export const router = Router();

router.use("/dashboard", dashboardRouter);
router.use("/projects", projectsRouter);
router.use("/meetings", meetingsRouter);
router.use("/anomalies", anomaliesRouter);
router.use("/attribution", attributionRouter);
router.post("/calculate-cost", calculateCost);
