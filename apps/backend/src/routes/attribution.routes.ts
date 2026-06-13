import { Router } from "express";
import {
	attributeMeeting,
	getAttributionPrefill,
} from "../controllers/attribution.controller.js";

export const attributionRouter = Router();

attributionRouter.get("/prefill", getAttributionPrefill);
attributionRouter.post("/", attributeMeeting);
