begin;
create table public.studio_wallets (
 user_id uuid primary key references auth.users(id) on delete cascade,
 seconds bigint not null default 0 check (seconds >= 0), expires_at timestamptz,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
grant select on public.studio_wallets to authenticated;
grant all on public.studio_wallets to service_role;
alter table public.studio_wallets enable row level security;
create policy studio_wallet_owner on public.studio_wallets for select to authenticated using (user_id = auth.uid());
create function public.studio_wallet_timestamp() returns trigger language plpgsql set search_path = public as $$ begin new.updated_at := now(); return new; end $$;
create trigger studio_wallet_updated before update on public.studio_wallets for each row execute function public.studio_wallet_timestamp();
create table public.studio_transactions (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 seconds bigint not null check (seconds <> 0), reference text not null unique,
 reason text not null, created_at timestamptz not null default now()
);
grant select on public.studio_transactions to authenticated;
grant select, insert on public.studio_transactions to service_role;
alter table public.studio_transactions enable row level security;
create policy studio_transactions_owner on public.studio_transactions for select to authenticated using (user_id = auth.uid());
create index studio_transactions_owner_date on public.studio_transactions (user_id, created_at desc);
create function public.studio_hours_ready() returns boolean language sql stable set search_path = public as $$ select true $$;
revoke all on function public.studio_hours_ready() from public, anon;
grant execute on function public.studio_hours_ready() to authenticated, service_role;
create function public.get_studio_account() returns table(seconds bigint, expires_at timestamptz)
language sql stable security definer set search_path = public as $$
 select case when w.expires_at is not null and w.expires_at <= now() then 0 else coalesce(w.seconds,0) end, w.expires_at
 from (select auth.uid() as uid) caller left join public.studio_wallets w on w.user_id = caller.uid where caller.uid is not null
$$;
revoke all on function public.get_studio_account() from public, anon;
grant execute on function public.get_studio_account() to authenticated;
create function public.post_studio_operation(p_user_id uuid, p_seconds bigint, p_reference text, p_reason text, p_days integer default 0)
returns bigint language plpgsql security definer set search_path = public as $$
declare w public.studio_wallets%rowtype; old public.studio_transactions%rowtype;
begin
 if p_seconds = 0 or p_reference = '' or p_days < 0 then raise exception 'Invalid studio operation'; end if;
 perform pg_advisory_xact_lock(hashtextextended('studio:' || p_user_id::text,0));
 insert into public.studio_wallets(user_id) values(p_user_id) on conflict do nothing;
 select * into w from public.studio_wallets where user_id = p_user_id for update;
 select * into old from public.studio_transactions where reference = p_reference;
 if found then
  if old.user_id <> p_user_id or old.seconds <> p_seconds then raise exception 'Reference mismatch'; end if;
  return case when w.expires_at <= now() then 0 else w.seconds end;
 end if;
 if w.expires_at <= now() then w.seconds := 0; end if;
 if w.seconds + p_seconds < 0 then raise exception 'Insufficient studio seconds'; end if;
 w.seconds := w.seconds + p_seconds;
 if p_seconds > 0 and p_days > 0 then w.expires_at := greatest(coalesce(w.expires_at, now()), now()+make_interval(days=>p_days)); end if;
 update public.studio_wallets set seconds=w.seconds, expires_at=w.expires_at where user_id=p_user_id;
 insert into public.studio_transactions(user_id,seconds,reference,reason) values(p_user_id,p_seconds,p_reference,p_reason);
 return w.seconds;
end $$;
revoke all on function public.post_studio_operation(uuid,bigint,text,text,integer) from public,anon,authenticated;
grant execute on function public.post_studio_operation(uuid,bigint,text,text,integer) to service_role;
insert into public.studio_wallets(user_id,seconds,expires_at)
select id,259200,now()+interval '365 days' from auth.users where raw_app_meta_data->>'camera_license'='true';
insert into public.studio_transactions(user_id,seconds,reference,reason)
select id,259200,'camera-welcome:'||id::text,'Bonus caméra : 72 heures' from auth.users where raw_app_meta_data->>'camera_license'='true';
commit;