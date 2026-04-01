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
import { createCustomer } from "@/lib/actions/customer-actions";

export function CreateCustomerDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contractStatus, setContractStatus] = useState<"active" | "negotiation" | "paused" | "completed">("active");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    startTransition(async () => {
      try {
        await createCustomer({
          name: name.trim(),
          contact_name: contactName.trim() || undefined,
          contact_email: contactEmail.trim() || undefined,
          contract_status: contractStatus,
        });
        setOpen(false);
        resetForm();
        toast.success("Kunde erstellt");
      } catch {
        toast.error("Fehler beim Erstellen des Kunden");
      }
    });
  }

  function resetForm() {
    setName("");
    setContactName("");
    setContactEmail("");
    setContractStatus("active");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <Plus className="h-4 w-4" />
        Neuer Kunde
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Neuen Kunden erstellen</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Firmenname *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. Musterfirma GmbH"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>Ansprechpartner</Label>
            <Input
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Optional..."
            />
          </div>

          <div className="space-y-2">
            <Label>E-Mail</Label>
            <Input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="Optional..."
            />
          </div>

          <div className="space-y-2">
            <Label>Vertragsstatus</Label>
            <Select value={contractStatus} onValueChange={(v) => setContractStatus((v ?? "active") as "active" | "negotiation" | "paused" | "completed")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Aktiv</SelectItem>
                <SelectItem value="negotiation">Verhandlung</SelectItem>
                <SelectItem value="paused">Pausiert</SelectItem>
                <SelectItem value="completed">Abgeschlossen</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={!name.trim() || isPending}
            >
              {isPending ? "Erstelle..." : "Kunde erstellen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
