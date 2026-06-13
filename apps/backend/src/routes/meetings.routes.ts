import { Router } from "express";
import { getMeetings } from "../controllers/meetings.controller.js";

export const meetingsRouter = Router();

meetingsRouter.get("/", getMeetings);
