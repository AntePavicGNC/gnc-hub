import Link from "next/link";
import { getCurrentUser } from "@/lib/queries/auth";
import { getMyTasks } from "@/lib/queries/tasks";
import {
  getDashboardStats,
  getUrgentProjects,
  getPipelineSummary,
  getWorkloadOverview,
  getRecentlyUpdated,
} from "@/lib/queries/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  AlertTriangle,
  KanbanSquare,
  Clock,
  ArrowRight,
} from "lucide-react";

function formatDate(date: string | null) {
  if (!date) return null;
  return new Date(date).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
  });
}

function daysUntil(date: string) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(date);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function DeadlineBadge({ date, label }: { date: string; label: string }) {
  const days = daysUntil(date);
  const variant = days < 0 ? "destructive" : days <= 3 ? "destructive" : "outline";
  return (
    <Badge variant={variant} className="text-[10px] shrink-0">
      {label}: {formatDate(date)} ({days < 0 ? `${Math.abs(days)}d überfällig` : `${days}d`})
    </Badge>
  );
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [stats, myTasks, urgentProjects, pipelineSummary, workload, recentlyUpdated] =
    await Promise.all([
      getDashboardStats(user.id),
      getMyTasks(user.id),
      getUrgentProjects(),
      getPipelineSummary(),
      getWorkloadOverview(),
      getRecentlyUpdated(),
    ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold">
          Hallo, {user.name.split(" ")[0]}
        </h2>
        <p className="text-muted-foreground">Hier ist dein Tages-Überblick.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Offene Aufgaben
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.openTasks}</div>
            <p className="text-xs text-muted-foreground">dir zugewiesen</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Überfällig
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={stats.overdueTasks > 0 ? "text-2xl font-bold text-destructive" : "text-2xl font-bold"}>
              {stats.overdueTasks}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Projekte aktiv
            </CardTitle>
            <KanbanSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeProjects}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Braucht Aufmerksamkeit
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={urgentProjects.length > 0 ? "text-2xl font-bold text-amber-600" : "text-2xl font-bold"}>
              {urgentProjects.length}
            </div>
            <p className="text-xs text-muted-foreground">Deadline in 3 Tagen</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Urgent Projects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Braucht Aufmerksamkeit
            </CardTitle>
            <Link
              href="/pipeline"
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              Alle <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {urgentProjects.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                Keine dringenden Projekte.
              </p>
            ) : (
              <div className="space-y-2">
                {urgentProjects.map((project: any) => (
                  <Link
                    key={project.id}
                    href={`/pipeline/${project.id}`}
                    className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {project.creator && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] font-semibold border px-1.5 py-0 shrink-0"
                          style={{
                            backgroundColor: `${project.creator.color}15`,
                            borderColor: `${project.creator.color}40`,
                            color: project.creator.color,
                          }}
                        >
                          {project.creator.short_code}
                        </Badge>
                      )}
                      <span className="text-sm font-medium truncate">
                        {project.customer.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {project.script_deadline && (
                        <DeadlineBadge date={project.script_deadline} label="Script" />
                      )}
                      {project.desired_post_date && (
                        <DeadlineBadge date={project.desired_post_date} label="Wunsch" />
                      )}
                      {!project.script_deadline && !project.desired_post_date && project.latest_post_date && (
                        <DeadlineBadge date={project.latest_post_date} label="Spät." />
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Meine Aufgaben</CardTitle>
          </CardHeader>
          <CardContent>
            {myTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                Keine offenen Aufgaben — gut gemacht!
              </p>
            ) : (
              <div className="space-y-1.5">
                {myTasks.slice(0, 8).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-muted/50"
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/pipeline/${task.project_id}`}
                        className="text-sm hover:underline"
                      >
                        {task.title}
                      </Link>
                    </div>
                    {task.estimated_minutes ? (
                      <span className="text-xs text-muted-foreground shrink-0">
                        {task.estimated_minutes}min
                      </span>
                    ) : null}
                  </div>
                ))}
                {myTasks.length > 8 && (
                  <p className="text-xs text-muted-foreground pt-1">
                    + {myTasks.length - 8} weitere
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pipeline Summary */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Pipeline-Übersicht</CardTitle>
            <Link
              href="/pipeline"
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              Pipeline <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {pipelineSummary.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">Keine aktiven Projekte.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {pipelineSummary.map(({ status, count }) => (
                  <Link
                    key={status}
                    href={`/pipeline?status=${status}`}
                    className="hover:opacity-80"
                  >
                    <Badge variant="outline" className="text-xs gap-1.5">
                      {status}
                      <span className="bg-primary/10 text-primary rounded-full px-1.5 py-0 text-[10px] font-bold">
                        {count}
                      </span>
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Workload Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Workload</CardTitle>
          </CardHeader>
          <CardContent>
            {workload.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">Keine zugewiesenen Aufgaben.</p>
            ) : (
              <div className="space-y-2.5">
                {workload.map((person) => {
                  const maxTasks = workload[0]?.taskCount || 1;
                  const percentage = Math.round((person.taskCount / maxTasks) * 100);
                  return (
                    <div key={person.id} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{person.name}</span>
                        <span className="text-muted-foreground">{person.taskCount} Aufgaben</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary/70 transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recently Updated */}
      <Card>
        <CardHeader>
          <CardTitle>Zuletzt bearbeitet</CardTitle>
        </CardHeader>
        <CardContent>
          {recentlyUpdated.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">Keine kürzlichen Änderungen.</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-5">
              {recentlyUpdated.map((project: any) => (
                <Link
                  key={project.id}
                  href={`/pipeline/${project.id}`}
                  className="flex items-center gap-2 rounded-md px-2 py-2 hover:bg-muted/50 border"
                >
                  {project.creator && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] font-semibold border px-1.5 py-0 shrink-0"
                      style={{
                        backgroundColor: `${project.creator.color}15`,
                        borderColor: `${project.creator.color}40`,
                        color: project.creator.color,
                      }}
                    >
                      {project.creator.short_code}
                    </Badge>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{project.customer.name}</p>
                    <p className="text-[10px] text-muted-foreground">{project.status}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
