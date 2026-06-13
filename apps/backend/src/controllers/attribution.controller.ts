import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/database.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ATTRIBUTION_SYSTEM_PROMPT } from "../prompts/attribution.prompt.js";

let genAI: GoogleGenerativeAI | null = null;

function getGenAI() {
  if (!genAI && process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
}

export async function attributeMeeting(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const {
      title,
      description = "",
      attendees = [],
    } = req.body as {
      title: string;
      description?: string;
      attendees?: string[];
    };

    if (!title?.trim()) {
      res
        .status(400)
        .json({ success: false, error: "Meeting title is required" });
      return;
    }

    // Fetch available projects for context
    const projects = await prisma.project.findMany({
      where: { status: { not: "completed" } },
      select: { id: true, name: true, code: true, description: true },
    });

    const ai = getGenAI();

    // Try AI attribution first
    if (ai) {
      try {
        const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
        const userPrompt = buildUserPrompt(
          title,
          description,
          attendees,
          projects,
        );

        const result = await model.generateContent([
          { text: ATTRIBUTION_SYSTEM_PROMPT },
          { text: userPrompt },
        ]);

        const text = result.response.text().trim();
        const jsonMatch = text.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]) as {
            project: string;
            confidence: number;
            reason: string;
          };

          const matchedProject = projects.find(
            (p) =>
              p.name.toLowerCase().includes(parsed.project.toLowerCase()) ||
              p.code.toLowerCase() === parsed.project.toLowerCase(),
          );

          res.json({
            success: true,
            data: {
              project: parsed.project,
              projectId: matchedProject?.id ?? null,
              confidence: parsed.confidence,
              reason: parsed.reason,
            },
          });
          return;
        }
      } catch (aiError) {
        console.warn(
          "Gemini attribution failed, using rule-based fallback:",
          aiError,
        );
      }
    }

    // Rule-based fallback
    const result = ruleBasedAttribution(
      title,
      description,
      attendees,
      projects,
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function calculateCost(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { employeeIds, durationMinutes } = req.body as {
      employeeIds: number[];
      durationMinutes: number;
    };

    if (!employeeIds?.length || !durationMinutes) {
      res
        .status(400)
        .json({
          success: false,
          error: "employeeIds and durationMinutes are required",
        });
      return;
    }

    const employees = await prisma.employee.findMany({
      where: { id: { in: employeeIds } },
    });

    const durationHours = durationMinutes / 60;
    const breakdown = employees.map((e) => ({
      employeeId: e.id,
      employeeName: e.name,
      hourlyRate: e.hourlyRate,
      cost: Math.round(e.hourlyRate * durationHours),
    }));

    const totalCost = breakdown.reduce((sum, b) => sum + b.cost, 0);

    res.json({
      success: true,
      data: { totalCost, breakdown, durationHours },
    });
  } catch (error) {
    next(error);
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function buildUserPrompt(
  title: string,
  description: string,
  attendees: string[],
  projects: { name: string; code: string; description: string }[],
): string {
  return `
Meeting Title: ${title}
Meeting Description: ${description || "N/A"}
Attendees: ${attendees.join(", ") || "N/A"}

Available Projects:
${projects.map((p) => `- ${p.name} (${p.code}): ${p.description}`).join("\n")}

Classify this meeting into one of the available projects. Return JSON only.
`.trim();
}

function ruleBasedAttribution(
  title: string,
  description: string,
  _attendees: string[],
  projects: { id: number; name: string; code: string; description: string }[],
): {
  project: string;
  projectId: number | null;
  confidence: number;
  reason: string;
} {
  const text = `${title} ${description}`.toLowerCase();

  for (const project of projects) {
    const projectTerms = [
      project.name.toLowerCase(),
      project.code.toLowerCase(),
    ];
    const matched = projectTerms.some((term) => text.includes(term));

    if (matched) {
      return {
        project: project.name,
        projectId: project.id,
        confidence: 78,
        reason: `Meeting title/description contains reference to ${project.name}.`,
      };
    }
  }

  return {
    project: "Unattributed",
    projectId: null,
    confidence: 35,
    reason:
      "No clear project indicators found in the meeting title or description.",
  };
}
