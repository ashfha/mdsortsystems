CREATE OR REPLACE FUNCTION public.get_public_recycling_stats()
RETURNS TABLE (
  total_inserted integer,
  white_inserted integer,
  colored_inserted integer,
  event_count integer,
  location_count integer,
  last_insertion_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COALESCE(SUM(i.quantity), 0)::integer AS total_inserted,
    COALESCE(SUM(i.quantity) FILTER (WHERE i.glass_type = 'white'), 0)::integer AS white_inserted,
    COALESCE(SUM(i.quantity) FILTER (WHERE i.glass_type = 'colored'), 0)::integer AS colored_inserted,
    COUNT(i.id)::integer AS event_count,
    (SELECT COUNT(*)::integer FROM public.locations) AS location_count,
    MAX(i.occurred_at) AS last_insertion_at
  FROM public.insertions i;
$$;

REVOKE ALL ON FUNCTION public.get_public_recycling_stats() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_recycling_stats() TO anon, authenticated;
