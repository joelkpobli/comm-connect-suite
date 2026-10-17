CREATE TABLE public.credit_transactions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 amount bigint NOT NULL,
 kind text NOT NULL,
 reason text NOT NULL,
 reference text NOT NULL UNIQUE,
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.credit_transactions TO authenticated;
GRANT ALL ON public.credit_transactions TO service_role;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own credit history" ON public.credit_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE INDEX credit_transactions_owner_date ON public.credit_transactions(user_id, created_at DESC, id);
CREATE FUNCTION public.validate_credit_transaction() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 IF TG_OP = 'UPDATE' THEN RAISE EXCEPTION 'Ledger entries are immutable'; END IF;
 IF NEW.amount = 0 OR NEW.kind NOT IN ('purchase','usage','adjustment','refund') OR length(NEW.reason) NOT BETWEEN 1 AND 200 OR length(NEW.reference) NOT BETWEEN 1 AND 200 THEN RAISE EXCEPTION 'Invalid credit operation'; END IF;
 IF NEW.kind = 'usage' AND NEW.amount >= 0 THEN RAISE EXCEPTION 'Usage must debit'; END IF;
 IF NEW.kind = 'purchase' AND NEW.amount <= 0 THEN RAISE EXCEPTION 'Purchase must credit'; END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.validate_credit_transaction() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER validate_credit_transaction BEFORE INSERT OR UPDATE ON public.credit_transactions FOR EACH ROW EXECUTE FUNCTION public.validate_credit_transaction();
CREATE FUNCTION public.post_credit_operation(p_user_id uuid,p_amount bigint,p_kind text,p_reason text,p_reference text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE old public.credit_transactions; result uuid; balance numeric;
BEGIN
 PERFORM id FROM public.profiles WHERE id=p_user_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Profile missing'; END IF;
 SELECT * INTO old FROM public.credit_transactions WHERE reference=p_reference;
 IF FOUND THEN
  IF old.user_id<>p_user_id OR old.amount<>p_amount OR old.kind<>p_kind OR old.reason<>p_reason THEN RAISE EXCEPTION 'Reference conflict'; END IF;
  RETURN old.id;
 END IF;
 SELECT COALESCE(sum(amount),0) INTO balance FROM public.credit_transactions WHERE user_id=p_user_id;
 IF balance+p_amount<0 THEN RAISE EXCEPTION 'Insufficient credits'; END IF;
 IF abs(balance+p_amount)>9007199254740991 THEN RAISE EXCEPTION 'Credit limit exceeded'; END IF;
 INSERT INTO public.credit_transactions(user_id,amount,kind,reason,reference) VALUES(p_user_id,p_amount,p_kind,p_reason,p_reference) RETURNING id INTO result;
 RETURN result;
END $$;
REVOKE ALL ON FUNCTION public.post_credit_operation(uuid,bigint,text,text,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.post_credit_operation(uuid,bigint,text,text,text) TO service_role;
CREATE FUNCTION public.get_credit_totals() RETURNS TABLE(balance bigint,received bigint,consumed bigint) LANGUAGE sql STABLE SET search_path=public AS $$
 SELECT COALESCE(sum(amount),0)::bigint, COALESCE(sum(greatest(amount,0)),0)::bigint, COALESCE(sum(greatest(-amount,0)),0)::bigint FROM public.credit_transactions WHERE user_id=auth.uid()
$$;
REVOKE ALL ON FUNCTION public.get_credit_totals() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_credit_totals() TO authenticated;
