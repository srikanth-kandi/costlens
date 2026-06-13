import { Request, Response, NextFunction } from "express";
import { Employee } from "@prisma/client";
import { prisma } from "../config/database.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ATTRIBUTION_SYSTEM_PROMPT } from "../prompts/attribution.prompt.js";

type AttributionProject = {
  id: number;
  name: string;
  code: string;
  description: string;
  status?: string;
};

let genAI: GoogleGenerativeAI | null = null;

function getGenAI() {
  if (!genAI && process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
}

export async function getAttributionPrefill(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    let projects = [] as AttributionProject[];
    let employees: { name: string; designation: string; department: string }[] = [];

    try {
      [projects, employees] = await Promise.all([
        prisma.project.findMany({
          where: { status: { not: "completed" } },
          select: {
            id: true,
            name: true,
            code: true,
            description: true,
            status: true,
          },
        }) as Promise<AttributionProject[]>,
        prisma.employee.findMany({
          select: { id: true, name: true, designation: true, department: true },
          take: 25,
        }),
      ]);
    } catch (dbError) {
      console.error(
        "❌ Database query failed in prefill:",
        dbError instanceof Error ? dbError.message : String(dbError),
      );
      // Return default fallback if database fails
      res.json({
        success: true,
        data: {
          title: "Project Status Sync",
          description:
            "Weekly cross-functional review to align priorities, blockers, and delivery milestones.",
          attendees: ["Team Lead", "Product Manager", "Engineer"],
        },
      });
      return;
    }

    const ai = getGenAI();

    if (ai && projects.length > 0 && employees.length > 0) {
      try {
        const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prefillPrompt = buildPrefillPrompt(projects, employees);

        const result = await model.generateContent([{ text: prefillPrompt }]);
        const text = result.response.text().trim();
        const jsonMatch = text.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]) as {
            title?: string;
            description?: string;
            attendees?: string[];
          };

          if (
            parsed.title?.trim() &&
            parsed.description?.trim() &&
            Array.isArray(parsed.attendees)
          ) {
            const attendees = parsed.attendees
              .map((name) => name.trim())
              .filter(Boolean)
              .slice(0, 8);

            if (attendees.length > 0) {
              res.json({
                success: true,
                data: {
                  title: parsed.title.trim(),
                  description: parsed.description.trim(),
                  attendees,
                },
              });
              return;
            }
          }
        }
      } catch (aiError) {
        console.warn(
          "Gemini prefill generation failed, using local fallback:",
          aiError instanceof Error ? aiError.message : String(aiError),
        );
      }
    } else if (!ai) {
      console.info("GEMINI_API_KEY not set; using local fallback for prefill");
    }

    const fallback = buildPrefillFallback(projects, employees);
    res.json({ success: true, data: fallback });
  } catch (error) {
    console.error("❌ getAttributionPrefill failed:", error);
    next(error);
  }
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
    const projects: AttributionProject[] = await prisma.project.findMany({
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
            (p: AttributionProject) =>
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

    const employees: Employee[] = await prisma.employee.findMany({
      where: { id: { in: employeeIds } },
    });

    const durationHours = durationMinutes / 60;
    const breakdown = employees.map((e: Employee) => ({
      employeeId: e.id,
      employeeName: e.name,
      hourlyRate: e.hourlyRate,
      cost: Math.round(e.hourlyRate * durationHours),
    }));

    const totalCost = breakdown.reduce(
      (sum: number, b: { cost: number }) => sum + b.cost,
      0,
    );

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

function buildPrefillPrompt(
  projects: AttributionProject[],
  employees: {
    name: string;
    designation: string;
    department: string;
  }[],
): string {
  return `You are helping generate a realistic prefill for a meeting attribution form in CostLens AI.

Return ONLY valid JSON in this exact shape:
{
  "title": "",
  "description": "",
  "attendees": ["", "", ""]
}

Rules:
- The meeting should be realistic and business-appropriate.
- Title should be concise and project-oriented.
- Description should be 1-2 sentences.
- attendees must be between 3 and 6 names from the provided list.
- Prefer active or at-risk projects.

Projects:
${projects.map((p) => `- ${p.name} (${p.code}) [${p.status ?? "active"}]: ${p.description}`).join("\n")}

Employees:
${employees.map((e) => `- ${e.name} (${e.designation}, ${e.department})`).join("\n")}`.trim();
}

function buildPrefillFallback(
  projects: AttributionProject[],
  employees: {
    name: string;
    designation: string;
    department: string;
  }[],
): {
  title: string;
  description: string;
  attendees: string[];
} {
  if (projects.length === 0 || employees.length === 0) {
    return {
      title: "Project Status Sync",
      description:
        "Weekly cross-functional review to align priorities, blockers, and delivery milestones.",
      attendees: ["Team Lead", "Product Manager", "Engineer"],
    };
  }

  const project = pickRandom(projects);
  const sameDept = employees.filter((e) =>
    project.name.toLowerCase().includes(e.department.toLowerCase()),
  );
  const attendeePool = sameDept.length >= 3 ? sameDept : employees;
  const attendees = pickRandomN(attendeePool, Math.min(4, attendeePool.length)).map(
    (e) => e.name,
  );

  return {
    title: `${project.code} Delivery Planning Sync`,
    description: `Planning session for ${project.name} to review priorities, dependencies, and execution timeline based on current project objectives.`,
    attendees,
  };
}

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function pickRandomN<T>(items: T[], count: number): T[] {
  const shuffled = [...items].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
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
