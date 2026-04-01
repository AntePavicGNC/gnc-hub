/**
 * Import script: Reads the Master sheet from the Excel file
 * and inserts customers + video_projects into Supabase.
 *
 * Run with: npx tsx scripts/import-excel.ts
 */

import XLSX from "xlsx";
import { createClient } from "@supabase/supabase-js";
import path from "path";

// Load .env.local
import { config } from "dotenv";
config({ path: path.resolve(__dirname, "../.env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Excel date serial → ISO date string
function excelDate(serial: number | null | undefined): string | null {
  if (!serial || typeof serial !== "number") return null;
  const d = new Date((serial - 25569) * 86400000);
  return d.toISOString().split("T")[0];
}

// Map Excel status strings to our pipeline step_names
const STATUS_MAP: Record<string, string> = {
  "1. Backoffice": "backoffice",
  "2. Meeting": "meeting",
  "3. Skript erstellen": "script_writing",
  "4. Skript zur Freigabe": "script_approval",
  "5. Skript Korrektur": "script_revision",
  "6. Drehen": "shooting",
  "7. Cutting": "cutting",
  "8. Videos zur Freigabe": "video_approval",
  "9. Video Korrektur": "video_revision",
  "10. Posting planen": "posting_planning",
  "11. Posting Freigabe": "posting_approval",
  "12. Gepostet": "posted",
  "13. Review erstellen": "review",
  Abgeschlossen: "completed",
};

// Map Excel product codes to creator short_codes
const CREATOR_MAP: Record<string, string> = {
  MRK: "MRK",
  MSK: "MSK",
  MRB: "MRB",
  ST: "ST",
};

async function main() {
  const excelPath = path.resolve(
    __dirname,
    "../../GNC Hub/Kundenprojekt-Liste Überblick .xlsx"
  );
  const wb = XLSX.readFile(excelPath);
  const ws = wb.Sheets["Master"];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

  // Skip header, filter valid rows
  const dataRows = rows.slice(1).filter((r) => r[0] && r[2]);

  // Fetch creators and product types from DB
  const { data: creators } = await supabase.from("creators").select("id, short_code");
  const { data: productTypes } = await supabase.from("product_types").select("id, name");

  const creatorMap = new Map(creators!.map((c) => [c.short_code, c.id]));
  const creatorVideoTypeId = productTypes!.find((pt) => pt.name === "Creator-Video")!.id;
  const socialRecruitingTypeId = productTypes!.find((pt) => pt.name === "Social Recruiting")!.id;
  const employerBrandingTypeId = productTypes!.find((pt) => pt.name === "Employer Branding Film")!.id;

  // Track unique customers (by company name)
  const customerIds = new Map<string, string>();

  let projectCount = 0;
  let customerCount = 0;
  let skipped = 0;

  for (const row of dataRows) {
    const produkt = String(row[0]).trim();
    const unternehmen = String(row[2]).trim();
    const anzahlVideos = typeof row[3] === "number" ? row[3] : 1;
    const aufnahmeort = String(row[4] || "Studio").trim().toLowerCase();
    const statusRaw = String(row[5] || "").trim();
    const wunschPosting = excelDate(row[6]);
    const spaetesterPosting = excelDate(row[7]);
    const drehtermin = excelDate(row[8]);
    const tatsaechlicherPosting = excelDate(row[9]);
    const cutterName = row[11] ? String(row[11]).trim() : null;
    const prioritaet = typeof row[12] === "number" ? Math.min(Math.max(row[12], 1), 8) : 4;
    const hinweis = row[13] ? String(row[13]).trim() : null;

    // Determine status, on_hold, rejected
    let status: string;
    let isOnHold = false;
    let isRejected = false;

    if (statusRaw === "On-Hold") {
      isOnHold = true;
      status = "backoffice"; // default, actual stage unknown
    } else if (statusRaw === "Abgelehnt") {
      isRejected = true;
      status = "backoffice";
    } else {
      status = STATUS_MAP[statusRaw] || "backoffice";
    }

    // Determine creator and product type
    let creatorId: string | null = null;
    let productTypeId: string;

    if (CREATOR_MAP[produkt]) {
      creatorId = creatorMap.get(CREATOR_MAP[produkt]) ?? null;
      productTypeId = creatorVideoTypeId;
    } else if (produkt === "Kunde") {
      // Check prefixes for product type
      if (unternehmen.startsWith("(SR)")) {
        productTypeId = socialRecruitingTypeId;
      } else if (unternehmen.startsWith("(EPV)") || unternehmen.startsWith("(EB)")) {
        productTypeId = employerBrandingTypeId;
      } else {
        productTypeId = creatorVideoTypeId; // default
      }
    } else {
      productTypeId = creatorVideoTypeId;
    }

    // Location mapping
    const location = aufnahmeort.includes("ort") ? "on_site" : "studio";

    // Build notes with cutter info (since we can't assign users yet)
    const noteParts: string[] = [];
    if (cutterName) noteParts.push(`Cutter: ${cutterName}`);
    if (hinweis) noteParts.push(hinweis);
    const notes = noteParts.length > 0 ? noteParts.join(" | ") : null;

    // Create customer if not exists
    if (!customerIds.has(unternehmen)) {
      const { data: existing } = await supabase
        .from("customers")
        .select("id")
        .eq("name", unternehmen)
        .limit(1)
        .single();

      if (existing) {
        customerIds.set(unternehmen, existing.id);
      } else {
        const { data: newCustomer, error } = await supabase
          .from("customers")
          .insert({ name: unternehmen })
          .select("id")
          .single();

        if (error) {
          console.error(`Kunde "${unternehmen}" fehlgeschlagen:`, error.message);
          skipped++;
          continue;
        }
        customerIds.set(unternehmen, newCustomer.id);
        customerCount++;
      }
    }

    const customerId = customerIds.get(unternehmen)!;

    // Insert video project
    const { error: projError } = await supabase.from("video_projects").insert({
      customer_id: customerId,
      product_type_id: productTypeId,
      creator_id: creatorId,
      video_count: anzahlVideos,
      location,
      status,
      priority: prioritaet,
      desired_post_date: wunschPosting,
      latest_post_date: spaetesterPosting,
      shoot_date: drehtermin,
      actual_post_date: tatsaechlicherPosting,
      notes,
      is_on_hold: isOnHold,
      is_rejected: isRejected,
    });

    if (projError) {
      console.error(`Projekt "${unternehmen}" fehlgeschlagen:`, projError.message);
      skipped++;
    } else {
      projectCount++;
    }
  }

  console.log(`\nImport abgeschlossen:`);
  console.log(`  ${customerCount} Kunden erstellt`);
  console.log(`  ${projectCount} Projekte importiert`);
  console.log(`  ${skipped} übersprungen (Fehler)`);
}

main().catch(console.error);
