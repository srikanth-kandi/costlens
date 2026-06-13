import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchDashboard } from "@/services/api";
import { fetchMeetings } from "@/services/api";
import { fetchProjects } from "@/services/api";
import { fetchAnomalies } from "@/services/api";
import { attributeMeeting, calculateCost } from "@/services/api";
import type {
  MeetingFilters,
  AttributionRequest,
  CostCalculationRequest,
} from "@costlens/shared";

// ─── Dashboard ────────────────────────────────────────────────────────────────
export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
    staleTime: 30_000,
  });
}

// ─── Meetings ─────────────────────────────────────────────────────────────────
export function useMeetings(filters: MeetingFilters = {}) {
  return useQuery({
    queryKey: ["meetings", filters],
    queryFn: () => fetchMeetings(filters),
    staleTime: 30_000,
  });
}

// ─── Projects ─────────────────────────────────────────────────────────────────
export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
    staleTime: 30_000,
  });
}

// ─── Anomalies ────────────────────────────────────────────────────────────────
export function useAnomalies(filters?: {
  type?: string;
  severity?: string;
  projectId?: number;
}) {
  return useQuery({
    queryKey: ["anomalies", filters],
    queryFn: () => fetchAnomalies(filters),
    staleTime: 30_000,
  });
}

// ─── AI Attribution ───────────────────────────────────────────────────────────
export function useAttributeMeeting() {
  return useMutation({
    mutationFn: (request: AttributionRequest) => attributeMeeting(request),
  });
}

// ─── Cost Calculation ─────────────────────────────────────────────────────────
export function useCalculateCost() {
  return useMutation({
    mutationFn: (request: CostCalculationRequest) => calculateCost(request),
  });
}
