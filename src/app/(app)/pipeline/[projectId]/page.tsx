import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { getProjectById, getCreators, getPipelineSteps, getTeamMembers } from "@/lib/queries/projects";
import { getTasksByProject } from "@/lib/queries/tasks";
import { ProjectForm } from "@/components/project/project-form";
import { StatusStepper } from "@/components/project/status-stepper";
import { TaskChecklist } from "@/components/project/task-checklist";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  const [project, creators, pipelineSteps, teamMembers, tasks] =
    await Promise.all([
      getProjectById(projectId),
      getCreators(),
      getPipelineSteps(),
      getTeamMembers(),
      getTasksByProject(projectId),
    ]);

  if (!project) notFound();

  // Filter pipeline steps for this project's product type
  const relevantSteps = pipelineSteps.filter(
    (s) => s.product_type_id === project.product_type_id
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link
          href="/pipeline"
          className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurück
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
        {/* Left: Project Details */}
        <Card>
          <CardHeader>
            <CardTitle>Projektdetails</CardTitle>
          </CardHeader>
          <CardContent>
            <ProjectForm
              project={project}
              creators={creators}
              teamMembers={teamMembers}
            />
          </CardContent>
        </Card>

        {/* Right: Pipeline Progress + Tasks */}
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-4">
              <StatusStepper
                projectId={project.id}
                currentStatus={project.status}
                steps={relevantSteps}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Aufgaben</CardTitle>
            </CardHeader>
            <CardContent>
              <TaskChecklist
                tasks={tasks}
                teamMembers={teamMembers}
                currentStep={project.status}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
