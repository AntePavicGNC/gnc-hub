"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { createProject } from "@/lib/actions/project-actions";
import type { Creator, ProductType } from "@/lib/types/database";
import type { CustomerWithProjects } from "@/lib/queries/customers";

export function CreateProjectDialog({
  customers,
  creators,
  productTypes,
}: {
  customers: CustomerWithProjects[];
  creators: Creator[];
  productTypes: ProductType[];
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [customerId, setCustomerId] = useState("");
  const [productTypeId, setProductTypeId] = useState("");
  const [creatorId, setCreatorId] = useState("");
  const [videoCount, setVideoCount] = useState("1");
  const [location, setLocation] = useState("studio");
  const [desiredDate, setDesiredDate] = useState("");
  const [latestDate, setLatestDate] = useState("");
  const [title, setTitle] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!customerId || !productTypeId) return;

    startTransition(async () => {
      try {
        await createProject({
          customer_id: customerId,
          product_type_id: productTypeId,
          creator_id: creatorId || undefined,
          video_count: parseInt(videoCount) || 1,
          location: location as "studio" | "on_site",
          desired_post_date: desiredDate || undefined,
          latest_post_date: latestDate || undefined,
          title: title || undefined,
        });
        setOpen(false);
        resetForm();
        toast.success("Projekt erstellt");
      } catch {
        toast.error("Fehler beim Erstellen des Projekts");
      }
    });
  }

  function resetForm() {
    setCustomerId("");
    setProductTypeId("");
    setCreatorId("");
    setVideoCount("1");
    setLocation("studio");
    setDesiredDate("");
    setLatestDate("");
    setTitle("");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <Plus className="h-4 w-4" />
        Neues Projekt
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Neues Projekt erstellen</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Kunde *</Label>
            <Select value={customerId} onValueChange={(v) => setCustomerId(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="Kunde wählen..." />
              </SelectTrigger>
              <SelectContent>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Produkttyp *</Label>
            <Select value={productTypeId} onValueChange={(v) => setProductTypeId(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="Produkttyp wählen..." />
              </SelectTrigger>
              <SelectContent>
                {productTypes.map((pt) => (
                  <SelectItem key={pt.id} value={pt.id}>
                    {pt.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Titel</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Optional..."
            />
          </div>

          <div className="space-y-2">
            <Label>Creator</Label>
            <Select value={creatorId} onValueChange={(v) => setCreatorId(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="Optional..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Kein Creator</SelectItem>
                {creators.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} ({c.short_code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Videos</Label>
              <Input
                type="number"
                min={1}
                value={videoCount}
                onChange={(e) => setVideoCount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Ort</Label>
              <Select value={location} onValueChange={(v) => setLocation(v ?? "studio")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="studio">Studio</SelectItem>
                  <SelectItem value="on_site">Vor Ort</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Wunschdatum</Label>
              <Input
                type="date"
                value={desiredDate}
                onChange={(e) => setDesiredDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Spätestens</Label>
              <Input
                type="date"
                value={latestDate}
                onChange={(e) => setLatestDate(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={!customerId || !productTypeId || isPending}
            >
              {isPending ? "Erstelle..." : "Projekt erstellen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
