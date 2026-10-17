REVOKE ALL ON public.credit_transactions FROM anon, authenticated, service_role;
GRANT SELECT ON public.credit_transactions TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.validate_credit_transaction() FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.post_credit_operation(uuid,bigint,text,text,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.post_credit_operation(uuid,bigint,text,text,text) TO service_role;