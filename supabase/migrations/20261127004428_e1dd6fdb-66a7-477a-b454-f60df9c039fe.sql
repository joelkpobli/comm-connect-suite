alter function public.get_studio_account() security invoker;
alter policy studio_wallet_owner on public.studio_wallets using (user_id = (select auth.uid()));
alter policy studio_transactions_owner on public.studio_transactions using (user_id = (select auth.uid()));