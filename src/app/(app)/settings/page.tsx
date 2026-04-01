import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold">Einstellungen</h2>
        <p className="text-muted-foreground">
          Creators, Produkt-Typen und Systemeinstellungen.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Konfiguration</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Die Einstellungsseite wird in Sprint 4 implementiert.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
