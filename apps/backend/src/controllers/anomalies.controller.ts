import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/database.js";

export async function getAnomalies(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { type, severity, projectId } = req.query as Record<string, string>;

    const where: any = {};
    if (type) where.type = type;
    if (severity) where.severity = severity;
    if (projectId) where.projectId = parseInt(projectId, 10);

    const anomalies = await prisma.anomaly.findMany({
      where,
      include: {
        project: true,
        meeting: true,
      },
      orderBy: [{ severity: "desc" }, { detectedAt: "desc" }],
    });

    const formatted = anomalies.map((a) => ({
      id: a.id,
      type: a.type,
      severity: a.severity,
      description: a.description,
      projectId: a.projectId,
      projectName: (a as any).project?.name,
      meetingId: a.meetingId,
      meetingTitle: (a as any).meeting?.title,
      amount: a.amount ?? undefined,
      detectedAt: a.detectedAt.toISOString(),
    }));

    res.json({ success: true, data: formatted });
  } catch (error) {
    next(error);
  }
}
