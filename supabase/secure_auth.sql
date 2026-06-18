-- ============================================================
-- MM ERP — Patch de segurança: verificação de senha no banco
-- Rode este script INTEIRO no SQL Editor do Supabase (uma vez só)
-- ============================================================

-- 1) Tranca acesso direto à tabela de usuários (ninguém de fora
--    consegue mais ler/escrever direto, só através das funções abaixo)
alter table public.erp_users enable row level security;
drop policy if exists "anon_select_erp_users" on public.erp_users;
drop policy if exists "anon_all_erp_users" on public.erp_users;
revoke all on public.erp_users from anon;
revoke all on public.erp_users from authenticated;

-- ============================================================
-- 2) Funções "porta de entrada" (SECURITY DEFINER = ignoram o
--    trancamento acima, mas só devolvem exatamente o que o app
--    precisa — nunca a senha criptografada nem a chave de recuperação)
-- ============================================================

create or replace function public.count_erp_users()
returns integer
language sql security definer set search_path = public
as $$ select count(*)::integer from erp_users; $$;

create or replace function public.verify_login(p_username text, p_password_hash text)
returns table (id uuid, username text, display_name text, role text)
language sql security definer set search_path = public
as $$
  select id, username, display_name, role
  from erp_users
  where username = lower(trim(p_username))
    and active = true
    and password_hash = p_password_hash
  limit 1;
$$;

create or replace function public.reset_password_with_recovery(
  p_username text, p_recovery_key text, p_new_hash text
) returns boolean
language plpgsql security definer set search_path = public
as $$
declare v_ok boolean;
begin
  select exists(
    select 1 from erp_users
    where username = lower(trim(p_username))
      and recovery_key = upper(trim(p_recovery_key))
      and active = true
  ) into v_ok;

  if v_ok then
    update erp_users set password_hash = p_new_hash
      where username = lower(trim(p_username));
  end if;

  return v_ok;
end;
$$;

create or replace function public.list_users_safe()
returns table (id uuid, username text, display_name text, role text,
               active boolean, last_login timestamptz, created_at timestamptz)
language sql security definer set search_path = public
as $$
  select id, username, display_name, role, active, last_login, created_at
  from erp_users
  order by created_at;
$$;

create or replace function public.create_erp_user(
  p_username text, p_display_name text, p_password_hash text,
  p_recovery_key text, p_role text
) returns boolean
language plpgsql security definer set search_path = public
as $$
begin
  insert into erp_users (username, display_name, password_hash, recovery_key, role, active)
  values (lower(trim(p_username)), trim(p_display_name), p_password_hash, p_recovery_key, p_role, true)
  on conflict (username) do nothing;
  return found;
end;
$$;

create or replace function public.set_user_active(p_id text, p_active boolean)
returns boolean
language plpgsql security definer set search_path = public
as $$
begin
  update erp_users set active = p_active where id::text = p_id;
  return found;
end;
$$;

create or replace function public.set_user_role(p_id text, p_role text)
returns boolean
language plpgsql security definer set search_path = public
as $$
begin
  update erp_users set role = p_role where id::text = p_id;
  return found;
end;
$$;

create or replace function public.touch_last_login(p_username text)
returns void
language sql security definer set search_path = public
as $$
  update erp_users set last_login = now() where username = lower(trim(p_username));
$$;

-- ============================================================
-- 3) Libera a execução dessas funções para o app (papel anon).
--    Repare que NENHUMA delas devolve password_hash ou recovery_key.
-- ============================================================
grant execute on function public.count_erp_users()                             to anon;
grant execute on function public.verify_login(text, text)                       to anon;
grant execute on function public.reset_password_with_recovery(text, text, text) to anon;
grant execute on function public.list_users_safe()                              to anon;
grant execute on function public.create_erp_user(text, text, text, text, text)  to anon;
grant execute on function public.set_user_active(text, boolean)                 to anon;
grant execute on function public.set_user_role(text, text)                      to anon;
grant execute on function public.touch_last_login(text)                         to anon;
