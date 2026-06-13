import { Router } from "express";
import { getAnomalies } from "../controllers/anomalies.controller.js";

export const anomaliesRouter = Router();

anomaliesRouter.get("/", getAnomalies);
