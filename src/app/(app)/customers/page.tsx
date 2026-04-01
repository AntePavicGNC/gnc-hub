import { Suspense } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCustomers } from "@/lib/queries/customers";
import { CustomerSearch } from "@/components/customers/customer-search";
import { Building2, Video } from "lucide-react";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : undefined;
  const customers = await getCustomers(search);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold">Kunden</h2>
          <p className="text-sm text-muted-foreground">
            {customers.length} Kunden
          </p>
        </div>
      </div>

      <Suspense fallback={null}>
        <CustomerSearch />
      </Suspense>

      <Card>
        <CardContent className="p-0">
          {customers.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              Keine Kunden gefunden.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kunde</TableHead>
                  <TableHead>Kontakt</TableHead>
                  <TableHead className="text-center">Projekte</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => {
                  const projectCount = customer.video_projects?.length ?? 0;
                  const activeCount =
                    customer.video_projects?.filter(
                      (p: any) => p.status !== "completed"
                    ).length ?? 0;

                  return (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <Link
                          href={`/pipeline?search=${encodeURIComponent(customer.name)}`}
                          className="flex items-center gap-2 font-medium hover:underline"
                        >
                          <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                          {customer.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {customer.contact_name && (
                          <span>{customer.contact_name}</span>
                        )}
                        {customer.contact_email && (
                          <span className="ml-2 text-xs">
                            {customer.contact_email}
                          </span>
                        )}
                        {!customer.contact_name && !customer.contact_email && "—"}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Video className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm">{projectCount}</span>
                          {activeCount > 0 && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              {activeCount} aktiv
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            customer.contract_status === "active"
                              ? "default"
                              : "outline"
                          }
                          className="text-xs"
                        >
                          {customer.contract_status === "active"
                            ? "Aktiv"
                            : customer.contract_status === "completed"
                              ? "Abgeschlossen"
                              : customer.contract_status === "paused"
                                ? "Pausiert"
                                : "Verhandlung"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
