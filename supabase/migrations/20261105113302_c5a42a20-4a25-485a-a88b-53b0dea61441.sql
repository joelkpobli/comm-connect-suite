CREATE TABLE public.balance_validity (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  credits_until timestamptz,
  audio_until timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.balance_validity TO authenticated;
GRANT ALL ON public.balance_validity TO service_role;
ALTER TABLE public.balance_validity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own validity read" ON public.balance_validity FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE FUNCTION public.expire_balances(p_user_id uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v public.balance_validity; bal bigint;
BEGIN
  PERFORM id FROM public.profiles WHERE id = p_user_id FOR UPDATE;
  SELECT * INTO v FROM public.balance_validity WHERE user_id = p_user_id;
  IF NOT FOUND THEN RETURN; END IF;
  IF v.credits_until IS NOT NULL AND v.credits_until < now() THEN
    SELECT COALESCE(sum(amount),0) INTO bal FROM public.credit_transactions WHERE user_id = p_user_id;
    IF bal > 0 THEN
      INSERT INTO public.credit_transactions(user_id, amount, kind, reason, reference)
      VALUES (p_user_id, -bal, 'adjustment', 'Points expirés (fin de validité)', 'expiry:credits:' || p_user_id || ':' || extract(epoch from v.credits_until)::bigint)
      ON CONFLICT (reference) DO NOTHING;
    END IF;
  END IF;
  IF v.audio_until IS NOT NULL AND v.audio_until < now() THEN
    SELECT COALESCE(sum(seconds),0) INTO bal FROM public.audio_time_transactions WHERE user_id = p_user_id;
    IF bal > 0 THEN
      INSERT INTO public.audio_time_transactions(user_id, seconds, kind, reason, reference)
      VALUES (p_user_id, -bal, 'adjustment', 'Minutes expirées (fin de validité)', 'expiry:audio:' || p_user_id || ':' || extract(epoch from v.audio_until)::bigint)
      ON CONFLICT (reference) DO NOTHING;
    END IF;
  END IF;
END $$;
REVOKE ALL ON FUNCTION public.expire_balances(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.expire_balances(uuid) TO service_role;

CREATE FUNCTION public.extend_validity(p_user_id uuid, p_target text, p_days int) RETURNS timestamptz LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE target timestamptz := now() + make_interval(days => p_days); result timestamptz;
BEGIN
  IF p_target NOT IN ('credits','audio') OR p_days NOT BETWEEN 1 AND 3650 THEN RAISE EXCEPTION 'Invalid validity'; END IF;
  INSERT INTO public.balance_validity(user_id) VALUES (p_user_id) ON CONFLICT (user_id) DO NOTHING;
  IF p_target = 'credits' THEN
    UPDATE public.balance_validity SET credits_until = greatest(COALESCE(credits_until, target), target), updated_at = now() WHERE user_id = p_user_id RETURNING credits_until INTO result;
  ELSE
    UPDATE public.balance_validity SET audio_until = greatest(COALESCE(audio_until, target), target), updated_at = now() WHERE user_id = p_user_id RETURNING audio_until INTO result;
  END IF;
  RETURN result;
END $$;
REVOKE ALL ON FUNCTION public.extend_validity(uuid,text,int) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.extend_validity(uuid,text,int) TO service_role;

CREATE OR REPLACE FUNCTION public.get_credit_totals() RETURNS TABLE(balance bigint,received bigint,consumed bigint) LANGUAGE sql STABLE SET search_path=public AS $$
 SELECT CASE WHEN EXISTS (SELECT 1 FROM public.balance_validity v WHERE v.user_id=auth.uid() AND v.credits_until < now()) THEN 0 ELSE COALESCE(sum(amount),0) END::bigint,
  COALESCE(sum(greatest(amount,0)),0)::bigint, COALESCE(sum(greatest(-amount,0)),0)::bigint
 FROM public.credit_transactions WHERE user_id=auth.uid()
$$;
CREATE OR REPLACE FUNCTION public.get_audio_seconds() RETURNS bigint LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$
  SELECT CASE WHEN EXISTS (SELECT 1 FROM public.balance_validity v WHERE v.user_id=auth.uid() AND v.audio_until < now()) THEN 0 ELSE COALESCE(sum(seconds),0) END::bigint
  FROM public.audio_time_transactions WHERE user_id = auth.uid()
$$;
CREATE OR REPLACE FUNCTION public.get_credit_snapshot() RETURNS jsonb LANGUAGE sql STABLE SET search_path=public AS $$
 SELECT jsonb_build_object(
  'totals',jsonb_build_object(
    'balance',CASE WHEN EXISTS (SELECT 1 FROM public.balance_validity v WHERE v.user_id=auth.uid() AND v.credits_until < now()) THEN 0 ELSE COALESCE(sum(amount),0) END,
    'received',COALESCE(sum(greatest(amount,0)),0),'consumed',COALESCE(sum(greatest(-amount,0)),0)),
  'validUntil',(SELECT credits_until FROM public.balance_validity WHERE user_id=auth.uid()),
  'audioValidUntil',(SELECT audio_until FROM public.balance_validity WHERE user_id=auth.uid()),
  'entries',(SELECT COALESCE(jsonb_agg(to_jsonb(t) ORDER BY t.created_at DESC,t.id),'[]'::jsonb) FROM (SELECT id,amount,kind,reason,reference,created_at FROM public.credit_transactions WHERE user_id=auth.uid() ORDER BY created_at DESC,id LIMIT 100) t))
 FROM public.credit_transactions WHERE user_id=auth.uid()
$$;