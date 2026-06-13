import { Router } from "express";
import {
	createMeeting,
	deleteMeeting,
	getMeetings,
	updateMeeting,
} from "../controllers/meetings.controller.js";

export const meetingsRouter = Router();

meetingsRouter.get("/", getMeetings);
meetingsRouter.post("/", createMeeting);
meetingsRouter.put("/:id", updateMeeting);
meetingsRouter.delete("/:id", deleteMeeting);
