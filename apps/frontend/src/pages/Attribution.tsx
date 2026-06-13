import { useState } from "react";
import {
  BrainCircuit,
  Send,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useAttributeMeeting } from "@/hooks/useApi";
import { mockProjects } from "@/data/mockData";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const EXAMPLE_MEETINGS = [
  {
    title: "Sprint Planning - Apollo Sprint 14",
    description:
      "Planning session for Apollo team to define sprint goals and task assignments for the upcoming two-week sprint.",
    attendees: ["Arjun Sharma", "Priya Nair", "Rahul Verma", "Sneha Reddy"],
  },
  {
    title: "Nexus Mobile UX Review",
    description:
      "Review latest user testing results for the Nexus mobile application and discuss improvements to onboarding flow.",
    attendees: ["Ananya Gupta", "Kiran Patel", "Sneha Reddy"],
  },
  {
    title: "Cloud Cost Optimization Meeting",
    description:
      "Review AWS and GCP spend for Horizon infrastructure, identify optimization opportunities.",
    attendees: ["Rohit Joshi", "Nitin Chopra", "Lakshmi Devi"],
  },
  {
    title: "Weekly Team Sync",
    description: "General team catch-up and status updates.",
    attendees: ["Pooja Agarwal", "Nitin Chopra"],
  },
];

function ConfidenceRing({ score }: { score: number }) {
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444";
  const r = 40;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="100" height="100" className="-rotate-90">
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth="8"
        />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
      </svg>
      <span className="absolute text-xl font-bold" style={{ color }}>
        {score}%
      </span>
    </div>
  );
}

export default function Attribution() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [attendeesInput, setAttendeesInput] = useState("");
  const { mutate, data: result, isPending, isError } = useAttributeMeeting();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const attendees = attendeesInput
      .split("\n")
      .map((a) => a.trim())
      .filter(Boolean);
    mutate({ title: title.trim(), description: description.trim(), attendees });
  };

  const loadExample = (example: (typeof EXAMPLE_MEETINGS)[0]) => {
    setTitle(example.title);
    setDescription(example.description);
    setAttendeesInput(example.attendees.join("\n"));
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
      {/* Input Panel */}
      <div className="xl:col-span-3 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-blue-600" />
              AI Attribution Engine
            </CardTitle>
            <CardDescription>
              Enter meeting details and let Gemini 2.5 Flash classify which
              project it belongs to.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Meeting Title <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="e.g. Sprint Planning - Apollo Sprint 14"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Meeting Description
                </label>
                <Textarea
                  placeholder="Describe the meeting context, agenda, and purpose..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Attendees{" "}
                  <span className="text-xs text-slate-400">(one per line)</span>
                </label>
                <Textarea
                  placeholder={`Arjun Sharma\nPriya Nair\nSneha Reddy`}
                  value={attendeesInput}
                  onChange={(e) => setAttendeesInput(e.target.value)}
                  rows={4}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={!title.trim() || isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Attributing with Gemini...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Attribute Meeting
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Example Meetings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">
              Try an Example
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {EXAMPLE_MEETINGS.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => loadExample(ex)}
                  className="text-left p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <p className="text-sm font-medium text-slate-700 truncate">
                    {ex.title}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {ex.attendees.length} attendees
                  </p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Result Panel */}
      <div className="xl:col-span-2 space-y-4">
        {isError && (
          <Alert variant="destructive">
            <XCircle className="w-4 h-4" />
            <AlertTitle>Attribution Failed</AlertTitle>
            <AlertDescription>
              Could not connect to Gemini API. Check your API key in the backend
              configuration.
            </AlertDescription>
          </Alert>
        )}

        {result ? (
          <Card className="border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Attribution Result
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Confidence Ring */}
              <div className="flex flex-col items-center py-4">
                <ConfidenceRing score={result.confidence} />
                <p className="text-sm font-medium text-slate-600 mt-2">
                  Confidence Score
                </p>
              </div>

              {/* Project */}
              <div className="rounded-lg bg-slate-50 p-4 space-y-3">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Predicted Project
                  </p>
                  <p className="text-xl font-bold text-slate-900 mt-1">
                    {result.project}
                  </p>
                  {result.projectId && (
                    <Badge variant="secondary" className="mt-1">
                      {mockProjects.find((p) => p.id === result.projectId)
                        ?.code ?? "UNKNOWN"}
                    </Badge>
                  )}
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    AI Reasoning
                  </p>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {result.reason}
                  </p>
                </div>
              </div>

              {/* Confidence Indicator */}
              <div>
                {result.confidence >= 80 ? (
                  <Alert variant="success">
                    <CheckCircle2 className="w-4 h-4" />
                    <AlertTitle>High Confidence</AlertTitle>
                    <AlertDescription>
                      Attribution is reliable and can be auto-assigned.
                    </AlertDescription>
                  </Alert>
                ) : result.confidence >= 60 ? (
                  <Alert variant="warning">
                    <AlertCircle className="w-4 h-4" />
                    <AlertTitle>Medium Confidence</AlertTitle>
                    <AlertDescription>
                      Manual review recommended before assignment.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert variant="destructive">
                    <XCircle className="w-4 h-4" />
                    <AlertTitle>Low Confidence</AlertTitle>
                    <AlertDescription>
                      Manual attribution required — AI cannot classify this
                      meeting.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed">
            <CardContent className="py-16 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                <BrainCircuit className="w-8 h-8 text-blue-400" />
              </div>
              <p className="text-slate-500 font-medium">
                Attribution result will appear here
              </p>
              <p className="text-sm text-slate-400 mt-1">
                Fill in the meeting details and click "Attribute Meeting"
              </p>
            </CardContent>
          </Card>
        )}

        {/* Available Projects Reference */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">
              Available Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mockProjects.map((p) => (
                <div key={p.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      {p.name}
                    </p>
                    <p className="text-xs text-slate-400 truncate max-w-[180px]">
                      {p.description}
                    </p>
                  </div>
                  <Badge
                    variant={
                      p.status === "active"
                        ? "success"
                        : p.status === "at-risk"
                          ? "warning"
                          : "secondary"
                    }
                    className="text-xs shrink-0"
                  >
                    {p.code}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
