CREATE TABLE public.ai_token_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tokens bigint NOT NULL,
  kind text NOT NULL,
  reason text NOT NULL,
  reference text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ai_token_transactions TO authenticated;
GRANT ALL ON public.ai_token_transactions TO service_role;
ALTER TABLE public.ai_token_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own ai tokens read" ON public.ai_token_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE INDEX ai_token_transactions_user_idx ON public.ai_token_transactions(user_id, created_at DESC);

CREATE FUNCTION public.validate_ai_token_transaction() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
 IF TG_OP <> 'INSERT' THEN RAISE EXCEPTION 'Ledger entries are immutable'; END IF;
 IF NEW.tokens = 0 OR NEW.kind NOT IN ('purchase','bonus','usage','adjustment','refund') OR length(NEW.reason) NOT BETWEEN 1 AND 200 OR length(NEW.reference) NOT BETWEEN 1 AND 200 THEN RAISE EXCEPTION 'Invalid token operation'; END IF;
 IF NEW.kind = 'usage' AND NEW.tokens >= 0 THEN RAISE EXCEPTION 'Usage must debit'; END IF;
 IF NEW.kind IN ('purchase','bonus') AND NEW.tokens <= 0 THEN RAISE EXCEPTION 'Purchase must credit'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER validate_ai_token_transaction BEFORE INSERT OR UPDATE OR DELETE ON public.ai_token_transactions FOR EACH ROW EXECUTE FUNCTION public.validate_ai_token_transaction();

ALTER TABLE public.balance_validity ADD COLUMN tokens_until timestamptz;

CREATE FUNCTION public.post_ai_token_operation(p_user_id uuid, p_tokens bigint, p_kind text, p_reason text, p_reference text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE old public.ai_token_transactions; result uuid; bal bigint;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext(p_user_id::text || ':tokens'));
  PERFORM id FROM public.profiles WHERE id = p_user_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Profile missing'; END IF;
  SELECT * INTO old FROM public.ai_token_transactions WHERE reference = p_reference;
  IF FOUND THEN
    IF old.user_id <> p_user_id OR old.tokens <> p_tokens OR old.kind <> p_kind OR old.reason <> p_reason THEN RAISE EXCEPTION 'Reference conflict'; END IF;
    RETURN old.id;
  END IF;
  SELECT COALESCE(sum(tokens),0) INTO bal FROM public.ai_token_transactions WHERE user_id = p_user_id;
  IF bal + p_tokens < 0 THEN RAISE EXCEPTION 'Insufficient AI tokens'; END IF;
  INSERT INTO public.ai_token_transactions(user_id, tokens, kind, reason, reference) VALUES (p_user_id, p_tokens, p_kind, p_reason, p_reference) RETURNING id INTO result;
  RETURN result;
END $$;
REVOKE ALL ON FUNCTION public.post_ai_token_operation(uuid,bigint,text,text,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.post_ai_token_operation(uuid,bigint,text,text,text) TO service_role;

CREATE FUNCTION public.get_ai_token_balance() RETURNS bigint LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT CASE WHEN EXISTS (SELECT 1 FROM public.balance_validity v WHERE v.user_id=auth.uid() AND v.tokens_until < now()) THEN 0 ELSE COALESCE(sum(tokens),0) END::bigint
  FROM public.ai_token_transactions WHERE user_id = auth.uid()
$$;
GRANT EXECUTE ON FUNCTION public.get_ai_token_balance() TO authenticated;

CREATE OR REPLACE FUNCTION public.extend_validity(p_user_id uuid, p_target text, p_days int) RETURNS timestamptz LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE target timestamptz := now() + make_interval(days => p_days); result timestamptz;
BEGIN
  IF p_target NOT IN ('credits','audio','tokens') OR p_days NOT BETWEEN 1 AND 3650 THEN RAISE EXCEPTION 'Invalid validity'; END IF;
  INSERT INTO public.balance_validity(user_id) VALUES (p_user_id) ON CONFLICT (user_id) DO NOTHING;
  IF p_target = 'credits' THEN
    UPDATE public.balance_validity SET credits_until = greatest(COALESCE(credits_until, target), target), updated_at = now() WHERE user_id = p_user_id RETURNING credits_until INTO result;
  ELSIF p_target = 'audio' THEN
    UPDATE public.balance_validity SET audio_until = greatest(COALESCE(audio_until, target), target), updated_at = now() WHERE user_id = p_user_id RETURNING audio_until INTO result;
  ELSE
    UPDATE public.balance_validity SET tokens_until = greatest(COALESCE(tokens_until, target), target), updated_at = now() WHERE user_id = p_user_id RETURNING tokens_until INTO result;
  END IF;
  RETURN result;
END $$;
REVOKE ALL ON FUNCTION public.extend_validity(uuid,text,int) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.extend_validity(uuid,text,int) TO service_role;