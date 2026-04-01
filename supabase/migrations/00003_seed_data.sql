-- GNC Hub: Seed Data — Creators, Product Types, Process Templates

-- ============================================================
-- CREATORS
-- ============================================================
INSERT INTO public.creators (name, short_code, platform, color, sort_order) VALUES
  ('Mr. Karriere',   'MRK', 'TikTok, Instagram', '#2563EB', 1),
  ('Ms. Karriere',   'MSK', 'TikTok, Instagram', '#DB2777', 2),
  ('Mr. Bewerbung',  'MRB', 'TikTok, Instagram', '#059669', 3),
  ('Schule.Tipps',   'ST',  'TikTok, Instagram', '#D97706', 4);

-- ============================================================
-- PRODUCT TYPES
-- ============================================================
INSERT INTO public.product_types (name, description) VALUES
  ('Creator-Video',           'Standard-Produkt: 1-5 Videos pro Paket, Studio oder vor Ort'),
  ('Social Recruiting',       'Lead-Kampagnen mit Ad-Budget, Targeting, Reporting'),
  ('Employer Branding Film',  'Hochwertige Imagefilme, aufwaendigere Produktion');

-- ============================================================
-- PROCESS TEMPLATES (Creator-Video Pipeline — 14 steps)
-- ============================================================
INSERT INTO public.process_templates (product_type_id, step_order, step_name, step_label, default_tasks)
SELECT pt.id, v.step_order, v.step_name, v.step_label, v.default_tasks::jsonb
FROM public.product_types pt
CROSS JOIN (VALUES
  (1,  'backoffice',       'Backoffice',        '[
    {"title": "Kunde und Projekt anlegen", "default_role": "backoffice", "estimated_minutes": 15},
    {"title": "Kunde in Mediaplan anlegen", "default_role": "backoffice", "estimated_minutes": 5},
    {"title": "Deal auf HubSpot auf Won-Fulfillment verschieben", "default_role": "backoffice", "estimated_minutes": 5},
    {"title": "Unterzeichnetes Angebot speichern", "default_role": "backoffice", "estimated_minutes": 5},
    {"title": "Artikel auf HubSpot eintragen", "default_role": "backoffice", "estimated_minutes": 10},
    {"title": "Rechnung mit Fragebogen und Meetinglink senden", "default_role": "backoffice", "estimated_minutes": 15}
  ]'),
  (2,  'meeting',          'Meeting',           '[
    {"title": "Rueckmeldung Fragebogen erhalten", "default_role": null, "estimated_minutes": 0},
    {"title": "Projektbesprechung mit Kunde", "default_role": "sm_manager", "estimated_minutes": 20}
  ]'),
  (3,  'script_writing',   'Skript erstellen',  '[
    {"title": "Aufgabenzeitplan planen", "default_role": "sm_manager", "estimated_minutes": 15},
    {"title": "Skripte erstellen", "default_role": "scripter", "estimated_minutes": 90}
  ]'),
  (4,  'script_approval',  'Skript Freigabe',   '[
    {"title": "Skript an Kunden senden", "default_role": "sm_manager", "estimated_minutes": 10},
    {"title": "Kunden-Freigabe abwarten", "default_role": null, "estimated_minutes": 0}
  ]'),
  (5,  'script_revision',  'Skript Korrektur',  '[
    {"title": "Skript-Feedback einarbeiten", "default_role": "scripter", "estimated_minutes": 30}
  ]'),
  (6,  'shooting',         'Drehen',            '[
    {"title": "Dreh durchfuehren", "default_role": "sm_manager", "estimated_minutes": 15},
    {"title": "Rohvideo auf Drive hochladen", "default_role": "sm_manager", "estimated_minutes": 10}
  ]'),
  (7,  'cutting',          'Cutting',           '[
    {"title": "Video schneiden", "default_role": "cutter", "estimated_minutes": 120},
    {"title": "Interne Korrekturschleife", "default_role": "cutter", "estimated_minutes": 20}
  ]'),
  (8,  'video_approval',   'Video Freigabe',    '[
    {"title": "Fertiges Video an Kunden senden", "default_role": "sm_manager", "estimated_minutes": 5},
    {"title": "Kunden-Freigabe abwarten", "default_role": null, "estimated_minutes": 0}
  ]'),
  (9,  'video_revision',   'Video Korrektur',   '[
    {"title": "Video-Feedback einarbeiten", "default_role": "cutter", "estimated_minutes": 30}
  ]'),
  (10, 'posting_planning', 'Posting planen',    '[
    {"title": "Postings einplanen", "default_role": "sm_manager", "estimated_minutes": 240}
  ]'),
  (11, 'posting_approval', 'Posting Freigabe',  '[
    {"title": "Posting-Freigabe einholen", "default_role": "sm_manager", "estimated_minutes": 10}
  ]'),
  (12, 'posted',           'Gepostet',          '[
    {"title": "Werbebudget einsetzen", "default_role": "sm_manager", "estimated_minutes": 20}
  ]'),
  (13, 'review',           'Review',            '[
    {"title": "Deal auf Won-Closed setzen", "default_role": "backoffice", "estimated_minutes": 2},
    {"title": "Insights erstellen", "default_role": "sm_manager", "estimated_minutes": 30},
    {"title": "Termin fuer Nachbesprechung machen", "default_role": "sm_manager", "estimated_minutes": 5},
    {"title": "Nachbesprechung durchfuehren", "default_role": "sm_manager", "estimated_minutes": 15}
  ]'),
  (14, 'completed',        'Abgeschlossen',     '[]')
) AS v(step_order, step_name, step_label, default_tasks)
WHERE pt.name = 'Creator-Video';
