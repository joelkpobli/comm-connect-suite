CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('question','suggestion','probleme','partenariat')),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  contact text NOT NULL CHECK (char_length(contact) BETWEEN 3 AND 255),
  message text NOT NULL CHECK (char_length(message) BETWEEN 5 AND 2000),
  user_id uuid,
  handled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read contact messages" ON public.contact_messages FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
GRANT SELECT ON public.contact_messages TO authenticated;
