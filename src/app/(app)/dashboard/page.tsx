import Link from "next/link";
import { getCurrentUser } from "@/lib/queries/auth";
import { getMyTasks } from "@/lib/queries/tasks";
import { getDashboardStats } from "@/lib/queries/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, AlertTriangle, KanbanSquare } from "lucide-react";

function formatDate(date: string | null) {
  if (!date) return null;
  return new Date(date).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [stats, myTasks] = await Promise.all([
    getDashboardStats(user.id),
    getMyTasks(user.id),
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
            <div
              className={
                stats.overdueTasks > 0
                  ? "text-2xl font-bold text-destructive"
                  : "text-2xl font-bold"
              }
            >
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
              Nächste Deadline
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.nextDeadline
                ? formatDate(stats.nextDeadline)
                : "—"}
            </div>
          </CardContent>
        </Card>
      </div>

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
              {myTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-muted/50"
                >
                  <Checkbox checked={false} disabled />
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/pipeline/${task.project_id}`}
                      className="text-sm hover:underline"
                    >
                      {task.title}
                    </Link>
                  </div>
                  {task.deadline && (
                    <Badge
                      variant={
                        new Date(task.deadline) < new Date()
                          ? "destructive"
                          : "outline"
                      }
                      className="text-[10px] shrink-0"
                    >
                      {formatDate(task.deadline)}
                    </Badge>
                  )}
                  {task.estimated_minutes ? (
                    <span className="text-xs text-muted-foreground shrink-0">
                      {task.estimated_minutes}min
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
