-- Fixes "infinite recursion detected in policy for relation profiles".
-- Every admin-check subquery (`select 1 from profiles where ... role = 'admin'`)
-- re-evaluates the profiles table's own RLS policies, which re-runs the same
-- subquery forever. A SECURITY DEFINER function executes as the table owner,
-- which bypasses RLS for this one lookup and breaks the loop.

create or replace function is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$;

drop policy if exists "profiles_select_own_or_admin" on profiles;
create policy "profiles_select_own_or_admin" on profiles for select
  using (id = auth.uid() or is_admin());

drop policy if exists "catalog_write_admin" on categories;
create policy "catalog_write_admin" on categories for all
  using (is_admin()) with check (is_admin());

drop policy if exists "catalog_write_admin" on equipment_items;
create policy "catalog_write_admin" on equipment_items for all
  using (is_admin()) with check (is_admin());

drop policy if exists "catalog_write_admin" on equipment_options;
create policy "catalog_write_admin" on equipment_options for all
  using (is_admin()) with check (is_admin());

drop policy if exists "catalog_write_admin" on dependency_rules;
create policy "catalog_write_admin" on dependency_rules for all
  using (is_admin()) with check (is_admin());

drop policy if exists "quotes_owner_or_admin" on quotes;
create policy "quotes_owner_or_admin" on quotes for all
  using (created_by = auth.uid() or is_admin())
  with check (created_by = auth.uid() or is_admin());

drop policy if exists "quote_revisions_via_parent_quote" on quote_revisions;
create policy "quote_revisions_via_parent_quote" on quote_revisions for all
  using (
    exists (
      select 1 from quotes q
      where q.id = quote_revisions.quote_id
        and (q.created_by = auth.uid() or is_admin())
    )
  )
  with check (
    exists (
      select 1 from quotes q
      where q.id = quote_revisions.quote_id
        and (q.created_by = auth.uid() or is_admin())
    )
  );
