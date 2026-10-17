CREATE FUNCTION public.get_credit_snapshot() RETURNS jsonb LANGUAGE sql STABLE SET search_path=public AS $$
 SELECT jsonb_build_object('totals',jsonb_build_object('balance',COALESCE(sum(amount),0),'received',COALESCE(sum(greatest(amount,0)),0),'consumed',COALESCE(sum(greatest(-amount,0)),0)),'entries',(SELECT COALESCE(jsonb_agg(to_jsonb(t) ORDER BY t.created_at DESC,t.id),'[]'::jsonb) FROM (SELECT id,amount,kind,reason,reference,created_at FROM public.credit_transactions WHERE user_id=auth.uid() ORDER BY created_at DESC,id LIMIT 100) t)) FROM public.credit_transactions WHERE user_id=auth.uid()
$$;
REVOKE ALL ON FUNCTION public.get_credit_snapshot() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_credit_snapshot() TO authenticated;