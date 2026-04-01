import { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getProjects, getCreators, getPipelineSteps, getTeamMembers, getProductTypes } from "@/lib/queries/projects";
import { getCustomers } from "@/lib/queries/customers";
import { PipelineList } from "@/components/pipeline/pipeline-list";
import { PipelineFilters } from "@/components/pipeline/pipeline-filters";
import { KanbanBoard } from "@/components/pipeline/kanban-board";
import { CreateProjectDialog } from "@/components/pipeline/create-project-dialog";
import type { ProjectFilters } from "@/lib/queries/projects";
import { List, Columns3 } from "lucide-react";

export default async function PipelinePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  const productTypeFilter = typeof params.product_type === "string" ? params.product_type : undefined;

  const filters: ProjectFilters = {
    creator: typeof params.creator === "string" ? params.creator : undefined,
    status: typeof params.status === "string" ? params.status : undefined,
    assignee: typeof params.assignee === "string" ? params.assignee : undefined,
    search: typeof params.search === "string" ? params.search : undefined,
    product_type: productTypeFilter,
  };

  const [projects, creators, pipelineSteps, teamMembers, customers, productTypes] = await Promise.all([
    getProjects(filters),
    getCreators(),
    getPipelineSteps(productTypeFilter),
    getTeamMembers(),
    getCustomers(),
    getProductTypes(),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold">Video-Pipeline</h2>
          <p className="text-sm text-muted-foreground">
            {projects.length} Projekte
          </p>
        </div>
        <CreateProjectDialog
          customers={customers}
          creators={creators}
          productTypes={productTypes}
        />
      </div>

      <Suspense fallback={null}>
        <PipelineFilters
          creators={creators}
          pipelineSteps={pipelineSteps}
          teamMembers={teamMembers}
          productTypes={productTypes}
        />
      </Suspense>

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">
            <List className="h-4 w-4 mr-1" />
            Liste
          </TabsTrigger>
          <TabsTrigger value="kanban">
            <Columns3 className="h-4 w-4 mr-1" />
            Kanban
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardContent className="p-0">
              <PipelineList projects={projects} pipelineSteps={pipelineSteps} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kanban">
          <KanbanBoard projects={projects} pipelineSteps={pipelineSteps} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
