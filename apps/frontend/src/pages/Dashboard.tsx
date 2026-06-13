import {
  DollarSign,
  CalendarDays,
  FolderKanban,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useDashboard } from "@/hooks/useApi";
import { mockDashboardData } from "@/data/mockData";
import MetricCard from "@/components/MetricCard";
import AnomalyBadge from "@/components/AnomalyBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  formatCurrency,
  formatDate,
  formatRelativeDate,
  getBudgetUtilizationColor,
  truncate,
} from "@/utils/formatters";

const PIE_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ef4444",
  "#06b6d4",
];

export default function Dashboard() {
  const { data: apiData, isLoading, isError } = useDashboard();
  const data = apiData ?? mockDashboardData;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          title="Total HR Cost"
          value={formatCurrency(data.kpis.totalHRCost)}
          icon={DollarSign}
          trend={data.kpis.costGrowth}
          trendLabel="vs last month"
          variant="default"
          loading={isLoading}
        />
        <MetricCard
          title="Total Meetings"
          value={data.kpis.totalMeetings}
          icon={CalendarDays}
          trend={data.kpis.meetingGrowth}
          trendLabel="vs last month"
          variant="default"
          loading={isLoading}
        />
        <MetricCard
          title="Active Projects"
          value={data.kpis.activeProjects}
          icon={FolderKanban}
          subtitle="of 5 total"
          variant="success"
          loading={isLoading}
        />
        <MetricCard
          title="Cost Overruns"
          value={data.kpis.costOverruns}
          icon={AlertTriangle}
          subtitle="projects over budget"
          variant={data.kpis.costOverruns > 0 ? "danger" : "success"}
          loading={isLoading}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Weekly Cost Trend */}
        <Card className="xl:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Weekly Cost Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={data.weeklyTrend}>
                <defs>
                  <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 12 }}
                  stroke="#94a3b8"
                />
                <YAxis
                  tickFormatter={(v) => formatCurrency(v)}
                  tick={{ fontSize: 11 }}
                  stroke="#94a3b8"
                  width={72}
                />
                <Tooltip
                  formatter={(value: number) => [
                    formatCurrency(value),
                    "HR Cost",
                  ]}
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="cost"
                  stroke="#3b82f6"
                  fill="url(#costGrad)"
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6", r: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Cost by Department Pie */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Cost by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={data.costByDepartment}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="cost"
                  nameKey="department"
                >
                  {data.costByDepartment.map((_entry, index) => (
                    <Cell
                      key={index}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), "Cost"]}
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    fontSize: 12,
                  }}
                />
                <Legend
                  formatter={(value) => (
                    <span style={{ fontSize: 11 }}>{value}</span>
                  )}
                  iconSize={8}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Cost by Project Bar */}
        <Card className="xl:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              Project Budget Utilization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.costByProject.map((proj) => (
                <div key={proj.projectId}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-700">
                        {proj.projectName}
                      </span>
                      <Badge
                        variant={
                          proj.budgetUtilization >= 100
                            ? "destructive"
                            : proj.budgetUtilization >= 80
                              ? "warning"
                              : "secondary"
                        }
                        className="text-xs py-0"
                      >
                        {proj.projectCode}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold">
                        {formatCurrency(proj.totalCost)}
                      </span>
                      <span className="text-xs text-slate-400 ml-1">
                        / {formatCurrency(proj.budget)}
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={Math.min(proj.budgetUtilization, 100)}
                    indicatorClassName={getBudgetUtilizationColor(
                      proj.budgetUtilization,
                    )}
                  />
                  <p className="text-xs text-slate-400 mt-0.5">
                    {proj.budgetUtilization.toFixed(1)}% utilized ·{" "}
                    {proj.meetingCount} meetings
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Anomalies */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Recent Anomalies
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {data.recentAnomalies.slice(0, 5).map((anomaly) => (
                <div key={anomaly.id} className="px-6 py-3">
                  <div className="flex items-start gap-2 mb-1">
                    <AnomalyBadge
                      type={anomaly.type}
                      severity={anomaly.severity}
                      showLabel={false}
                    />
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {truncate(anomaly.description, 80)}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {formatRelativeDate(anomaly.detectedAt)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Meetings */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Recent Meetings</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50/60">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Meeting
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Project
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Duration
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Participants
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Cost
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.recentMeetings.map((m) => (
                  <tr
                    key={m.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-3">
                      <p className="font-medium text-slate-800">
                        {truncate(m.title, 45)}
                      </p>
                      <p className="text-xs text-slate-400">
                        {formatDate(m.meetingDate)}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={m.projectId ? "secondary" : "outline"}
                        className="text-xs"
                      >
                        {m.projectName ?? "Unattributed"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {m.durationMinutes}m
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {m.participants?.length ?? 0}
                    </td>
                    <td className="px-6 py-3 text-right font-semibold text-slate-800">
                      {formatCurrency(m.cost ?? 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
