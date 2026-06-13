import { Router } from "express";
import { attributeMeeting } from "../controllers/attribution.controller.js";

export const attributionRouter = Router();

attributionRouter.post("/", attributeMeeting);
