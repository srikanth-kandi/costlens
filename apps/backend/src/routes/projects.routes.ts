import { Router } from "express";
import {
  createProject,
  deleteProject,
  getProjects,
  getProjectById,
  updateProject,
} from "../controllers/projects.controller.js";

export const projectsRouter = Router();

projectsRouter.get("/", getProjects);
projectsRouter.post("/", createProject);
projectsRouter.get("/:id", getProjectById);
projectsRouter.put("/:id", updateProject);
projectsRouter.delete("/:id", deleteProject);
