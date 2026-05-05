-- Insertions table: each event when something is inserted at a location
CREATE TABLE public.insertions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  occurred_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_insertions_location ON public.insertions(location_id);
CREATE INDEX idx_insertions_user ON public.insertions(user_id);

ALTER TABLE public.insertions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own insertions"
  ON public.insertions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own insertions"
  ON public.insertions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own insertions"
  ON public.insertions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own insertions"
  ON public.insertions FOR DELETE
  USING (auth.uid() = user_id);

-- Aggregated stats view per location
CREATE VIEW public.location_stats
WITH (security_invoker = on) AS
SELECT
  l.id AS location_id,
  l.user_id,
  COALESCE(SUM(i.quantity), 0)::INTEGER AS total_inserted,
  COUNT(i.id)::INTEGER AS event_count,
  MAX(i.occurred_at) AS last_insertion_at
FROM public.locations l
LEFT JOIN public.insertions i ON i.location_id = l.id
GROUP BY l.id, l.user_id;

-- Enable realtime for live dashboard updates
ALTER TABLE public.insertions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.insertions;
ALTER TABLE public.locations REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.locations;