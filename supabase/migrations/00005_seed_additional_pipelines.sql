-- Social Recruiting Pipeline (10 steps)
INSERT INTO public.process_templates (product_type_id, step_order, step_name, step_label, default_tasks)
SELECT pt.id, v.step_order, v.step_name, v.step_label, v.default_tasks::jsonb
FROM public.product_types pt
CROSS JOIN (VALUES
  (1,  'backoffice',        'Backoffice',          '[
    {"title": "Kunde und Projekt anlegen", "default_role": "backoffice", "estimated_minutes": 15},
    {"title": "Deal auf HubSpot verschieben", "default_role": "backoffice", "estimated_minutes": 5},
    {"title": "Rechnung senden", "default_role": "backoffice", "estimated_minutes": 10}
  ]'),
  (2,  'briefing',          'Briefing',            '[
    {"title": "Briefing-Fragebogen senden", "default_role": "sm_manager", "estimated_minutes": 10},
    {"title": "Briefing-Call durchfuehren", "default_role": "sm_manager", "estimated_minutes": 30}
  ]'),
  (3,  'campaign_setup',    'Kampagne aufsetzen',  '[
    {"title": "Kampagnen-Struktur erstellen", "default_role": "sm_manager", "estimated_minutes": 60},
    {"title": "Tracking-Pixel einrichten", "default_role": "sm_manager", "estimated_minutes": 20}
  ]'),
  (4,  'ad_creation',       'Ad-Erstellung',       '[
    {"title": "Creatives erstellen", "default_role": "cutter", "estimated_minutes": 120},
    {"title": "Ad-Copy schreiben", "default_role": "scripter", "estimated_minutes": 45}
  ]'),
  (5,  'ad_approval',       'Ad-Freigabe',         '[
    {"title": "Ads an Kunden senden", "default_role": "sm_manager", "estimated_minutes": 10},
    {"title": "Kunden-Freigabe abwarten", "default_role": null, "estimated_minutes": 0}
  ]'),
  (6,  'campaign_live',     'Kampagne Live',        '[
    {"title": "Kampagne starten", "default_role": "sm_manager", "estimated_minutes": 15}
  ]'),
  (7,  'optimization',      'Optimierung',         '[
    {"title": "Performance ueberpruefen", "default_role": "sm_manager", "estimated_minutes": 30},
    {"title": "Ads optimieren/anpassen", "default_role": "sm_manager", "estimated_minutes": 45}
  ]'),
  (8,  'reporting',         'Reporting',           '[
    {"title": "Report erstellen", "default_role": "sm_manager", "estimated_minutes": 60},
    {"title": "Report an Kunden senden", "default_role": "sm_manager", "estimated_minutes": 10}
  ]'),
  (9,  'review',            'Review',              '[
    {"title": "Deal auf Won-Closed setzen", "default_role": "backoffice", "estimated_minutes": 2},
    {"title": "Nachbesprechung durchfuehren", "default_role": "sm_manager", "estimated_minutes": 15}
  ]'),
  (10, 'completed',         'Abgeschlossen',       '[]')
) AS v(step_order, step_name, step_label, default_tasks)
WHERE pt.name = 'Social Recruiting';

-- Employer Branding Film Pipeline (12 steps)
INSERT INTO public.process_templates (product_type_id, step_order, step_name, step_label, default_tasks)
SELECT pt.id, v.step_order, v.step_name, v.step_label, v.default_tasks::jsonb
FROM public.product_types pt
CROSS JOIN (VALUES
  (1,  'backoffice',        'Backoffice',          '[
    {"title": "Kunde und Projekt anlegen", "default_role": "backoffice", "estimated_minutes": 15},
    {"title": "Deal auf HubSpot verschieben", "default_role": "backoffice", "estimated_minutes": 5},
    {"title": "Rechnung senden", "default_role": "backoffice", "estimated_minutes": 10}
  ]'),
  (2,  'meeting',           'Meeting',             '[
    {"title": "Projektbesprechung mit Kunde", "default_role": "sm_manager", "estimated_minutes": 30}
  ]'),
  (3,  'concept_writing',   'Konzept erstellen',   '[
    {"title": "Konzept/Storyboard erstellen", "default_role": "scripter", "estimated_minutes": 180},
    {"title": "Shotlist erstellen", "default_role": "scripter", "estimated_minutes": 60}
  ]'),
  (4,  'concept_approval',  'Konzept Freigabe',    '[
    {"title": "Konzept an Kunden senden", "default_role": "sm_manager", "estimated_minutes": 10},
    {"title": "Kunden-Freigabe abwarten", "default_role": null, "estimated_minutes": 0}
  ]'),
  (5,  'pre_production',    'Pre-Production',      '[
    {"title": "Location scouten/organisieren", "default_role": "sm_manager", "estimated_minutes": 60},
    {"title": "Equipment & Crew planen", "default_role": "sm_manager", "estimated_minutes": 45},
    {"title": "Drehplan erstellen", "default_role": "sm_manager", "estimated_minutes": 30}
  ]'),
  (6,  'shooting',          'Dreh',                '[
    {"title": "Dreh durchfuehren", "default_role": "sm_manager", "estimated_minutes": 480},
    {"title": "Rohmaterial sichern und hochladen", "default_role": "sm_manager", "estimated_minutes": 30}
  ]'),
  (7,  'post_production',   'Post-Production',     '[
    {"title": "Rohschnitt erstellen", "default_role": "cutter", "estimated_minutes": 360},
    {"title": "Color Grading", "default_role": "cutter", "estimated_minutes": 120},
    {"title": "Sound Design & Musik", "default_role": "cutter", "estimated_minutes": 90},
    {"title": "Feinschnitt", "default_role": "cutter", "estimated_minutes": 120}
  ]'),
  (8,  'video_approval',    'Video Freigabe',      '[
    {"title": "Video an Kunden senden", "default_role": "sm_manager", "estimated_minutes": 10},
    {"title": "Kunden-Freigabe abwarten", "default_role": null, "estimated_minutes": 0}
  ]'),
  (9,  'video_revision',    'Video Korrektur',     '[
    {"title": "Feedback einarbeiten", "default_role": "cutter", "estimated_minutes": 60}
  ]'),
  (10, 'delivery',          'Auslieferung',        '[
    {"title": "Finale Version exportieren", "default_role": "cutter", "estimated_minutes": 15},
    {"title": "An Kunden ausliefern", "default_role": "sm_manager", "estimated_minutes": 10}
  ]'),
  (11, 'review',            'Review',              '[
    {"title": "Deal auf Won-Closed setzen", "default_role": "backoffice", "estimated_minutes": 2},
    {"title": "Nachbesprechung durchfuehren", "default_role": "sm_manager", "estimated_minutes": 15}
  ]'),
  (12, 'completed',         'Abgeschlossen',       '[]')
) AS v(step_order, step_name, step_label, default_tasks)
WHERE pt.name = 'Employer Branding Film';
