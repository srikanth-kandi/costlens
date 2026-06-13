import { Router } from "express";
import {
  getProjects,
  getProjectById,
} from "../controllers/projects.controller.js";

export const projectsRouter = Router();

projectsRouter.get("/", getProjects);
projectsRouter.get("/:id", getProjectById);
