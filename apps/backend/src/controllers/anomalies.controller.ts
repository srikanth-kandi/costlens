import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/database.js";

type AnomalyWithRelations = {
  id: number;
  type: string;
  severity: string;
  description: string;
  projectId: number | null;
  meetingId: number | null;
  amount: number | null;
  detectedAt: Date;
  project: { name: string } | null;
  meeting: { title: string } | null;
};

const anomalyTypes = [
  "budget_exceeded",
  "low_confidence",
  "expensive_meeting",
  "resource_imbalance",
  "budget_risk",
] as const;

const anomalySeverities = ["low", "medium", "high", "critical"] as const;

export async function getAnomalies(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { type, severity, projectId } = req.query as Record<string, string>;

    const where: Record<string, unknown> = {};
    if (type && anomalyTypes.includes(type as (typeof anomalyTypes)[number])) {
      where.type = type;
    }
    if (
      severity &&
      anomalySeverities.includes(severity as (typeof anomalySeverities)[number])
    ) {
      where.severity = severity;
    }
    if (projectId) where.projectId = parseInt(projectId, 10);

    const anomalies = await prisma.anomaly.findMany({
      where,
      include: {
        project: true,
        meeting: true,
      },
      orderBy: [{ severity: "desc" }, { detectedAt: "desc" }],
    });

    const formatted = (anomalies as AnomalyWithRelations[]).map(
      (a: AnomalyWithRelations) => ({
        id: a.id,
        type: a.type,
        severity: a.severity,
        description: a.description,
        projectId: a.projectId,
        projectName: a.project?.name,
        meetingId: a.meetingId,
        meetingTitle: a.meeting?.title,
        amount: a.amount ?? undefined,
        detectedAt: a.detectedAt.toISOString(),
      }),
    );

    res.json({ success: true, data: formatted });
  } catch (error) {
    next(error);
  }
}
