import "dotenv/config";
import { PrismaClient } from "@prisma/client";

type MeetingParticipantWithEmployee = {
  meetingId: number;
  employeeId: number;
  employee: {
    hourlyRate: number;
  };
};

const prisma = new PrismaClient();

// ─── Seed Data ─────────────────────────────────────────────────────────────────

const employees = [
  {
    name: "Arjun Sharma",
    email: "arjun.sharma@costlens.io",
    designation: "Engineering Manager",
    department: "Engineering",
    hourlyRate: 3500,
  },
  {
    name: "Priya Nair",
    email: "priya.nair@costlens.io",
    designation: "Senior Software Engineer",
    department: "Engineering",
    hourlyRate: 2800,
  },
  {
    name: "Rahul Verma",
    email: "rahul.verma@costlens.io",
    designation: "Software Engineer",
    department: "Engineering",
    hourlyRate: 1800,
  },
  {
    name: "Sneha Reddy",
    email: "sneha.reddy@costlens.io",
    designation: "Product Manager",
    department: "Product",
    hourlyRate: 3000,
  },
  {
    name: "Vikram Singh",
    email: "vikram.singh@costlens.io",
    designation: "Senior Product Manager",
    department: "Product",
    hourlyRate: 3800,
  },
  {
    name: "Ananya Gupta",
    email: "ananya.gupta@costlens.io",
    designation: "UX Designer",
    department: "Design",
    hourlyRate: 2200,
  },
  {
    name: "Kiran Patel",
    email: "kiran.patel@costlens.io",
    designation: "Senior UX Designer",
    department: "Design",
    hourlyRate: 2600,
  },
  {
    name: "Deepak Kumar",
    email: "deepak.kumar@costlens.io",
    designation: "Data Scientist",
    department: "Data Science",
    hourlyRate: 3200,
  },
  {
    name: "Meera Iyer",
    email: "meera.iyer@costlens.io",
    designation: "Data Analyst",
    department: "Data Science",
    hourlyRate: 2400,
  },
  {
    name: "Rohit Joshi",
    email: "rohit.joshi@costlens.io",
    designation: "DevOps Engineer",
    department: "Engineering",
    hourlyRate: 2600,
  },
  {
    name: "Kavitha Menon",
    email: "kavitha.menon@costlens.io",
    designation: "Marketing Lead",
    department: "Marketing",
    hourlyRate: 2800,
  },
  {
    name: "Sanjay Bhat",
    email: "sanjay.bhat@costlens.io",
    designation: "Marketing Analyst",
    department: "Marketing",
    hourlyRate: 1800,
  },
  {
    name: "Lakshmi Devi",
    email: "lakshmi.devi@costlens.io",
    designation: "Finance Manager",
    department: "Finance",
    hourlyRate: 3200,
  },
  {
    name: "Ajay Mehta",
    email: "ajay.mehta@costlens.io",
    designation: "Financial Analyst",
    department: "Finance",
    hourlyRate: 2200,
  },
  {
    name: "Pooja Agarwal",
    email: "pooja.agarwal@costlens.io",
    designation: "HR Manager",
    department: "HR",
    hourlyRate: 2600,
  },
  {
    name: "Nitin Chopra",
    email: "nitin.chopra@costlens.io",
    designation: "Operations Manager",
    department: "Operations",
    hourlyRate: 2800,
  },
  {
    name: "Sunita Rao",
    email: "sunita.rao@costlens.io",
    designation: "Software Engineer",
    department: "Engineering",
    hourlyRate: 1800,
  },
  {
    name: "Abhishek Das",
    email: "abhishek.das@costlens.io",
    designation: "Senior Software Engineer",
    department: "Engineering",
    hourlyRate: 2600,
  },
  {
    name: "Rekha Pillai",
    email: "rekha.pillai@costlens.io",
    designation: "Product Designer",
    department: "Design",
    hourlyRate: 2000,
  },
  {
    name: "Manish Tiwari",
    email: "manish.tiwari@costlens.io",
    designation: "QA Engineer",
    department: "Engineering",
    hourlyRate: 1600,
  },
];

const projects = [
  {
    name: "Project Apollo",
    code: "APOLLO",
    description: "Core platform re-architecture and microservices migration",
    budget: 1500000,
    status: "active" as const,
    teamSize: 8,
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-12-31"),
  },
  {
    name: "Project Horizon",
    code: "HORIZON",
    description: "Cloud infrastructure modernization and DevSecOps pipeline",
    budget: 800000,
    status: "active" as const,
    teamSize: 5,
    startDate: new Date("2024-02-01"),
    endDate: new Date("2024-09-30"),
  },
  {
    name: "Project Nexus",
    code: "NEXUS",
    description: "Mobile-first customer engagement application",
    budget: 600000,
    status: "at_risk" as const,
    teamSize: 6,
    startDate: new Date("2024-03-01"),
    endDate: new Date("2024-11-30"),
  },
  {
    name: "Project Orion",
    code: "ORION",
    description: "Advanced analytics and business intelligence platform",
    budget: 1200000,
    status: "active" as const,
    teamSize: 7,
    startDate: new Date("2024-01-15"),
    endDate: new Date("2025-03-31"),
  },
  {
    name: "Project Vega",
    code: "VEGA",
    description: "Enterprise security compliance and access management",
    budget: 400000,
    status: "on_hold" as const,
    teamSize: 4,
    startDate: new Date("2024-05-01"),
    endDate: new Date("2024-10-31"),
  },
];

const meetingTitles = [
  [
    "Sprint Planning",
    "Sprint Retrospective",
    "Sprint Review",
    "Backlog Grooming",
    "Technical Design Review",
  ],
  [
    "Infrastructure Review",
    "DevOps Sync",
    "CI/CD Pipeline Discussion",
    "Cloud Cost Optimization",
    "Security Audit",
  ],
  [
    "Mobile UX Review",
    "App Architecture Discussion",
    "User Testing Feedback",
    "Release Planning",
    "Bug Triage",
  ],
  [
    "Analytics Dashboard Review",
    "KPI Planning Session",
    "Data Pipeline Discussion",
    "BI Tool Evaluation",
    "Metrics Review",
  ],
  [
    "Security Compliance Review",
    "Access Control Audit",
    "Vendor Security Assessment",
    "VAPT Discussion",
    "Policy Review",
  ],
];

function getDateInPast(daysAgo: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickRandomN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

async function main() {
  console.log("🌱 Seeding CostLens AI database...");

  // Clear existing data
  await prisma.anomaly.deleteMany();
  await prisma.meetingParticipant.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.costSummary.deleteMany();
  await prisma.project.deleteMany();
  await prisma.employee.deleteMany();

  // Seed employees
  const createdEmployees = await Promise.all(
    employees.map((emp) => prisma.employee.create({ data: emp })),
  );
  console.log(`✅ Created ${createdEmployees.length} employees`);

  // Seed projects
  const createdProjects = await Promise.all(
    projects.map((proj) => prisma.project.create({ data: proj })),
  );
  console.log(`✅ Created ${createdProjects.length} projects`);

  // Seed meetings (100 meetings)
  const createdMeetings: any[] = [];
  for (let i = 0; i < 100; i++) {
    const projectIndex = Math.floor(Math.random() * 5);
    const project = createdProjects[projectIndex];
    const titleOptions = meetingTitles[projectIndex];
    const titleBase = pickRandom(titleOptions);
    const sprintNum = Math.floor(Math.random() * 10) + 1;
    const title = titleBase.includes("Sprint")
      ? `${titleBase} - Sprint ${sprintNum}`
      : titleBase;
    const daysAgo = Math.floor(Math.random() * 90);
    const durationMinutes = pickRandom([30, 45, 60, 90, 120]);
    const confidenceScore =
      Math.random() > 0.15
        ? Math.floor(Math.random() * 30) + 70
        : Math.floor(Math.random() * 70);

    const meeting = await prisma.meeting.create({
      data: {
        title,
        description: `Discussion regarding ${project.name} - ${title.toLowerCase()}`,
        durationMinutes,
        meetingDate: getDateInPast(daysAgo),
        projectId: project.id,
        confidenceScore,
      },
    });
    createdMeetings.push(meeting);
  }
  console.log(`✅ Created ${createdMeetings.length} meetings`);

  // Seed meeting participants (~3-5 per meeting = ~300-500 total)
  let participantCount = 0;
  for (const meeting of createdMeetings) {
    const numParticipants = Math.floor(Math.random() * 4) + 2; // 2-5 participants
    const selectedEmployees = pickRandomN(createdEmployees, numParticipants);
    await prisma.meetingParticipant.createMany({
      data: selectedEmployees.map((emp) => ({
        meetingId: meeting.id,
        employeeId: emp.id,
      })),
      skipDuplicates: true,
    });
    participantCount += selectedEmployees.length;
  }
  console.log(`✅ Created ~${participantCount} meeting participants`);

  // Calculate meeting costs and cost summaries
  const projectCosts: Record<
    number,
    { totalCost: number; meetingCount: number; hoursSpent: number }
  > = {};
  createdProjects.forEach((p) => {
    projectCosts[p.id] = { totalCost: 0, meetingCount: 0, hoursSpent: 0 };
  });

  for (const meeting of createdMeetings) {
    const participants = await prisma.meetingParticipant.findMany({
      where: { meetingId: meeting.id },
      include: { employee: true },
    });

    const durationHours = meeting.durationMinutes / 60;
    const cost = (participants as MeetingParticipantWithEmployee[]).reduce(
      (sum: number, p: MeetingParticipantWithEmployee) =>
        sum + p.employee.hourlyRate * durationHours,
      0,
    );

    await prisma.meeting.update({
      where: { id: meeting.id },
      data: { cost },
    });

    if (meeting.projectId) {
      projectCosts[meeting.projectId].totalCost += cost;
      projectCosts[meeting.projectId].meetingCount += 1;
      projectCosts[meeting.projectId].hoursSpent += durationHours;
    }
  }

  // Create cost summaries
  for (const project of createdProjects) {
    const stats = projectCosts[project.id];
    const budgetUtilization = (stats.totalCost / project.budget) * 100;
    await prisma.costSummary.create({
      data: {
        projectId: project.id,
        totalCost: Math.round(stats.totalCost),
        meetingCount: stats.meetingCount,
        hoursSpent: Math.round(stats.hoursSpent * 10) / 10,
        budgetUtilization: Math.round(budgetUtilization * 10) / 10,
      },
    });
  }
  console.log(`✅ Created cost summaries`);

  // Seed anomalies (20)
  const anomalyData = [
    {
      type: "budget_exceeded" as const,
      severity: "critical" as const,
      description: "Project Nexus has exceeded its allocated budget by 12%",
      projectId: createdProjects[2].id,
      amount: 72000,
    },
    {
      type: "budget_risk" as const,
      severity: "high" as const,
      description:
        "Project Apollo at 82% budget utilization with 3 months remaining",
      projectId: createdProjects[0].id,
      amount: 1230000,
    },
    {
      type: "expensive_meeting" as const,
      severity: "high" as const,
      description:
        "All-hands architecture review cost ₹18,400 for a 2-hour session",
      projectId: createdProjects[0].id,
      meetingId: createdMeetings[0].id,
      amount: 18400,
    },
    {
      type: "low_confidence" as const,
      severity: "medium" as const,
      description:
        "15 meetings in the last week have confidence scores below 70%",
      projectId: null,
      amount: undefined,
    },
    {
      type: "resource_imbalance" as const,
      severity: "high" as const,
      description:
        "Arjun Sharma allocated to 68% of Engineering meetings this month",
      projectId: createdProjects[0].id,
      amount: undefined,
    },
    {
      type: "budget_exceeded" as const,
      severity: "high" as const,
      description: "Project Horizon meeting costs exceeded Q3 budget by 8%",
      projectId: createdProjects[1].id,
      amount: 64000,
    },
    {
      type: "expensive_meeting" as const,
      severity: "medium" as const,
      description: "Vendor evaluation meeting for Orion cost ₹14,200",
      projectId: createdProjects[3].id,
      meetingId: createdMeetings[5].id,
      amount: 14200,
    },
    {
      type: "budget_risk" as const,
      severity: "medium" as const,
      description: "Project Orion at 75% budget utilization",
      projectId: createdProjects[3].id,
      amount: 900000,
    },
    {
      type: "low_confidence" as const,
      severity: "low" as const,
      description:
        "Sprint Retrospective meeting has 45% attribution confidence",
      projectId: createdProjects[0].id,
      meetingId: createdMeetings[10].id,
      amount: undefined,
    },
    {
      type: "expensive_meeting" as const,
      severity: "high" as const,
      description: "Annual security audit meeting cost ₹22,600",
      projectId: createdProjects[4].id,
      meetingId: createdMeetings[15].id,
      amount: 22600,
    },
    {
      type: "resource_imbalance" as const,
      severity: "medium" as const,
      description: "Sneha Reddy is attending 71% of all product meetings",
      projectId: createdProjects[2].id,
      amount: undefined,
    },
    {
      type: "budget_exceeded" as const,
      severity: "critical" as const,
      description: "Nexus mobile app development costs have overrun by ₹72,000",
      projectId: createdProjects[2].id,
      amount: 72000,
    },
    {
      type: "low_confidence" as const,
      severity: "medium" as const,
      description:
        "Marketing Sync meeting cannot be attributed to any project (38%)",
      projectId: null,
      amount: undefined,
    },
    {
      type: "expensive_meeting" as const,
      severity: "medium" as const,
      description:
        "Data pipeline architecture review cost ₹11,800 for 90-min session",
      projectId: createdProjects[3].id,
      amount: 11800,
    },
    {
      type: "budget_risk" as const,
      severity: "high" as const,
      description: "Project Vega showing budget risk due to extended timeline",
      projectId: createdProjects[4].id,
      amount: 340000,
    },
    {
      type: "resource_imbalance" as const,
      severity: "low" as const,
      description:
        "Deepak Kumar allocated to multiple project meetings simultaneously",
      projectId: createdProjects[3].id,
      amount: undefined,
    },
    {
      type: "low_confidence" as const,
      severity: "low" as const,
      description: "Ops weekly sync has ambiguous project attribution (52%)",
      projectId: null,
      amount: undefined,
    },
    {
      type: "expensive_meeting" as const,
      severity: "critical" as const,
      description: "Executive strategy offsite meeting cost ₹48,000",
      projectId: createdProjects[0].id,
      amount: 48000,
    },
    {
      type: "budget_risk" as const,
      severity: "medium" as const,
      description: "Horizon infrastructure costs trending 20% above plan",
      projectId: createdProjects[1].id,
      amount: 640000,
    },
    {
      type: "resource_imbalance" as const,
      severity: "high" as const,
      description:
        "Core engineering team attending 4+ hours of meetings daily on Apollo",
      projectId: createdProjects[0].id,
      amount: undefined,
    },
  ];

  await prisma.anomaly.createMany({ data: anomalyData });
  console.log(`✅ Created ${anomalyData.length} anomalies`);

  console.log("\n🎉 Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
