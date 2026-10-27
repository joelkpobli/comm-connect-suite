CREATE TABLE public.audio_time_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  seconds bigint NOT NULL CHECK (seconds <> 0),
  kind text NOT NULL CHECK (kind IN ('purchase','usage','adjustment','refund')),
  reason text NOT NULL CHECK (length(reason) BETWEEN 1 AND 200),
  reference text NOT NULL UNIQUE CHECK (length(reference) BETWEEN 1 AND 200),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (kind <> 'usage' OR seconds < 0),
  CHECK (kind <> 'purchase' OR seconds > 0)
);
GRANT SELECT ON public.audio_time_transactions TO authenticated;
GRANT SELECT ON public.audio_time_transactions TO service_role;
ALTER TABLE public.audio_time_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own audio time read" ON public.audio_time_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE INDEX audio_time_transactions_user_idx ON public.audio_time_transactions(user_id, created_at DESC);

CREATE FUNCTION public.post_audio_operation(p_user_id uuid, p_seconds bigint, p_kind text, p_reason text, p_reference text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE old public.audio_time_transactions; result uuid; bal numeric;
BEGIN
  PERFORM id FROM public.profiles WHERE id = p_user_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Profile missing'; END IF;
  SELECT * INTO old FROM public.audio_time_transactions WHERE reference = p_reference;
  IF FOUND THEN
    IF old.user_id <> p_user_id OR old.seconds <> p_seconds OR old.kind <> p_kind OR old.reason <> p_reason THEN RAISE EXCEPTION 'Reference conflict'; END IF;
    RETURN old.id;
  END IF;
  SELECT COALESCE(sum(seconds),0) INTO bal FROM public.audio_time_transactions WHERE user_id = p_user_id;
  IF bal + p_seconds < 0 THEN RAISE EXCEPTION 'Insufficient audio time'; END IF;
  INSERT INTO public.audio_time_transactions(user_id, seconds, kind, reason, reference) VALUES (p_user_id, p_seconds, p_kind, p_reason, p_reference) RETURNING id INTO result;
  RETURN result;
END $$;
REVOKE ALL ON FUNCTION public.post_audio_operation(uuid,bigint,text,text,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.post_audio_operation(uuid,bigint,text,text,text) TO service_role;

CREATE FUNCTION public.get_audio_seconds() RETURNS bigint LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$
  SELECT COALESCE(sum(seconds),0)::bigint FROM public.audio_time_transactions WHERE user_id = auth.uid()
$$;
REVOKE ALL ON FUNCTION public.get_audio_seconds() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_audio_seconds() TO authenticated;