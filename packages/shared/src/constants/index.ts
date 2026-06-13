export const DEPARTMENTS = [
  "Engineering",
  "Product",
  "Design",
  "Marketing",
  "Finance",
  "Operations",
  "HR",
  "Data Science",
] as const;

export type Department = (typeof DEPARTMENTS)[number];

export const PROJECT_STATUSES = [
  "active",
  "on-hold",
  "completed",
  "at-risk",
] as const;

export const ANOMALY_TYPES = {
  BUDGET_EXCEEDED: "budget_exceeded",
  LOW_CONFIDENCE: "low_confidence",
  EXPENSIVE_MEETING: "expensive_meeting",
  RESOURCE_IMBALANCE: "resource_imbalance",
  BUDGET_RISK: "budget_risk",
} as const;

export const ANOMALY_THRESHOLDS = {
  LOW_CONFIDENCE_SCORE: 70,
  EXPENSIVE_MEETING_COST: 10000,
  RESOURCE_IMBALANCE_PERCENT: 60,
  BUDGET_RISK_PERCENT: 80,
} as const;

export const API_BASE_URL =
  typeof window !== "undefined"
    ? ((import.meta as any)?.env?.VITE_API_URL ?? "http://localhost:3001")
    : (process.env.API_URL ?? "http://localhost:3001");
