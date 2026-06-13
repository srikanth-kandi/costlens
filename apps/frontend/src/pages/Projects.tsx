import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  FolderKanban,
  TrendingUp,
  Calendar,
  Users,
  DollarSign,
} from "lucide-react";
import { useProjects } from "@/hooks/useApi";
import { mockCostSummaries, mockProjects } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  formatCurrency,
  formatPercentage,
  getBudgetUtilizationColor,
  truncate,
} from "@/utils/formatters";

const STATUS_STYLES: Record<
  string,
  {
    label: string;
    variant: "success" | "warning" | "destructive" | "secondary";
  }
> = {
  active: { label: "Active", variant: "success" },
  "on-hold": { label: "On Hold", variant: "secondary" },
  on_hold: { label: "On Hold", variant: "secondary" },
  completed: { label: "Completed", variant: "secondary" },
  "at-risk": { label: "At Risk", variant: "warning" },
  at_risk: { label: "At Risk", variant: "warning" },
};

const BAR_COLORS = ["#3b82f6", "#10b981", "#ef4444", "#8b5cf6", "#6b7280"];

export default function Projects() {
  const { data: apiProjects, isLoading } = useProjects();
  const projects = apiProjects ?? mockProjects;
  const costSummaries = mockCostSummaries;

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected =
    selectedId !== null ? projects.find((p) => p.id === selectedId) : null;
  const selectedSummary =
    selectedId !== null
      ? costSummaries.find((c) => c.projectId === selectedId)
      : null;

  const chartData = costSummaries.map((c, i) => ({
    name: c.projectCode,
    cost: c.totalCost,
    budget: c.budget,
    fill: BAR_COLORS[i % BAR_COLORS.length],
  }));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5 pb-4">
            <p className="text-xs text-slate-500 font-medium">Total Projects</p>
            <p className="text-2xl font-bold mt-1">{projects.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4">
            <p className="text-xs text-slate-500 font-medium">Active</p>
            <p className="text-2xl font-bold mt-1 text-green-600">
              {projects.filter((p) => p.status === "active").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4">
            <p className="text-xs text-slate-500 font-medium">
              At Risk / Overrun
            </p>
            <p className="text-2xl font-bold mt-1 text-red-600">
              {projects.filter((p) => p.status === "at-risk").length +
                costSummaries.filter((c) => c.budgetUtilization > 100).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4">
            <p className="text-xs text-slate-500 font-medium">Total Budget</p>
            <p className="text-2xl font-bold mt-1">
              {formatCurrency(projects.reduce((sum, p) => sum + p.budget, 0))}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-blue-600" />
            Cost vs Budget by Project
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis
                tickFormatter={(v) => formatCurrency(v)}
                tick={{ fontSize: 11 }}
                width={72}
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  formatCurrency(value),
                  name === "cost" ? "Actual Cost" : "Budget",
                ]}
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  fontSize: 12,
                }}
              />
              <Bar
                dataKey="budget"
                fill="#e2e8f0"
                name="budget"
                radius={[4, 4, 0, 0]}
              />
              <Bar dataKey="cost" name="cost" radius={[4, 4, 0, 0]}>
                {chartData.map((_entry, index) => (
                  <Cell
                    key={index}
                    fill={
                      costSummaries[index]?.budgetUtilization >= 100
                        ? "#ef4444"
                        : costSummaries[index]?.budgetUtilization >= 80
                          ? "#f59e0b"
                          : "#3b82f6"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Project Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6 space-y-3">
                  <div className="h-5 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-full" />
                  <div className="h-2 bg-slate-100 rounded w-full mt-4" />
                </CardContent>
              </Card>
            ))
          : projects.map((project) => {
              const summary = costSummaries.find(
                (c) => c.projectId === project.id,
              );
              const utilization = summary?.budgetUtilization ?? 0;
              const statusStyle = STATUS_STYLES[project.status] ?? {
                label: project.status,
                variant: "secondary",
              };

              return (
                <Card
                  key={project.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedId === project.id ? "ring-2 ring-blue-500" : ""
                  }`}
                  onClick={() =>
                    setSelectedId(selectedId === project.id ? null : project.id)
                  }
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-900">
                            {project.name}
                          </h3>
                        </div>
                        <Badge
                          variant={statusStyle.variant}
                          className="text-xs"
                        >
                          {statusStyle.label}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-center w-10 h-10 bg-blue-50 rounded-lg shrink-0">
                        <FolderKanban className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mb-4">
                      {truncate(project.description, 80)}
                    </p>

                    <div className="space-y-3">
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Budget Utilization</span>
                        <span
                          className={
                            utilization >= 100
                              ? "text-red-600 font-semibold"
                              : utilization >= 80
                                ? "text-amber-600 font-semibold"
                                : ""
                          }
                        >
                          {formatPercentage(utilization)}
                        </span>
                      </div>
                      <Progress
                        value={Math.min(utilization, 100)}
                        indicatorClassName={getBudgetUtilizationColor(
                          utilization,
                        )}
                      />

                      <div className="grid grid-cols-3 gap-2 pt-1">
                        <div className="text-center">
                          <p className="text-xs text-slate-400">Cost</p>
                          <p className="text-sm font-semibold text-slate-800">
                            {formatCurrency(summary?.totalCost ?? 0)}
                          </p>
                        </div>
                        <div className="text-center border-x border-slate-100">
                          <p className="text-xs text-slate-400">Meetings</p>
                          <p className="text-sm font-semibold text-slate-800">
                            {summary?.meetingCount ?? 0}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-slate-400">Hours</p>
                          <p className="text-sm font-semibold text-slate-800">
                            {summary?.hoursSpent ?? 0}h
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
      </div>

      {/* Selected Project Detail */}
      {selected && selectedSummary && (
        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader>
            <CardTitle className="text-base">
              {selected.name} — Detailed View
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                <DollarSign className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <p className="text-xs text-slate-500">Total HR Cost</p>
                <p className="text-lg font-bold text-slate-900">
                  {formatCurrency(selectedSummary.totalCost)}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                <Calendar className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                <p className="text-xs text-slate-500">Meetings</p>
                <p className="text-lg font-bold text-slate-900">
                  {selectedSummary.meetingCount}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                <TrendingUp className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                <p className="text-xs text-slate-500">Budget Used</p>
                <p className="text-lg font-bold text-slate-900">
                  {formatPercentage(selectedSummary.budgetUtilization)}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                <Users className="w-5 h-5 text-green-600 mx-auto mb-1" />
                <p className="text-xs text-slate-500">Team Size</p>
                <p className="text-lg font-bold text-slate-900">
                  {selected.teamSize ?? "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
