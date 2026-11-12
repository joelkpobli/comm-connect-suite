CREATE TABLE public.maintenance_modules (
  module text PRIMARY KEY,
  active boolean NOT NULL DEFAULT false,
  message text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.maintenance_modules TO anon, authenticated;
GRANT ALL ON public.maintenance_modules TO service_role;
ALTER TABLE public.maintenance_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Maintenance public read" ON public.maintenance_modules FOR SELECT TO anon, authenticated USING (true);
INSERT INTO public.maintenance_modules(module) VALUES ('global'),('swap_live'),('studio'),('translation'),('ai_generation'),('payments');

CREATE TABLE public.user_notices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  severity text NOT NULL DEFAULT 'info',
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.user_notices TO authenticated;
GRANT ALL ON public.user_notices TO service_role;
ALTER TABLE public.user_notices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own notices read" ON public.user_notices FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE INDEX user_notices_user_idx ON public.user_notices(user_id, created_at DESC);

CREATE TABLE public.provider_usage_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  kind text NOT NULL,
  status text NOT NULL,
  cost_usd numeric(10,4) NOT NULL DEFAULT 0,
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.provider_usage_events TO service_role;
ALTER TABLE public.provider_usage_events ENABLE ROW LEVEL SECURITY;
CREATE INDEX provider_usage_events_idx ON public.provider_usage_events(provider, created_at DESC);