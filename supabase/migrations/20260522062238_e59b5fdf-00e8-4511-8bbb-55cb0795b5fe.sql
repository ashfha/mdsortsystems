-- Track glass color per insertion
CREATE TYPE public.glass_type AS ENUM ('white', 'colored');

ALTER TABLE public.insertions
  ADD COLUMN glass_type public.glass_type NOT NULL DEFAULT 'white';

-- Rebuild the stats view to also split by glass type
DROP VIEW IF EXISTS public.location_stats;
CREATE VIEW public.location_stats
WITH (security_invoker = true) AS
SELECT
  location_id,
  COALESCE(SUM(quantity), 0)::int AS total_inserted,
  COALESCE(SUM(quantity) FILTER (WHERE glass_type = 'white'), 0)::int AS white_inserted,
  COALESCE(SUM(quantity) FILTER (WHERE glass_type = 'colored'), 0)::int AS colored_inserted,
  COUNT(*)::int AS event_count,
  MAX(occurred_at) AS last_insertion_at
FROM public.insertions
GROUP BY location_id;