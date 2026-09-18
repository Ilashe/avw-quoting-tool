-- AVW Quoting Tool — migration 0069
-- Gives every quote the sequential "Quote Number" printed on AVW's quote form (the sample the
-- client supplied is 26720), so the generated PDF carries a real reference instead of a
-- placeholder. Existing quotes are backfilled in creation order. Re-runnable.

create sequence if not exists quote_number_seq start with 26721;

alter table quotes add column if not exists quote_number bigint;

-- Backfill any quote created before this column existed, oldest first, so the numbers follow
-- the order the quotes were actually written.
do $$
declare
  q record;
begin
  for q in select id from quotes where quote_number is null order by created_at loop
    update quotes set quote_number = nextval('quote_number_seq') where id = q.id;
  end loop;
end;
$$;

alter table quotes alter column quote_number set default nextval('quote_number_seq');

create unique index if not exists quotes_quote_number_key on quotes (quote_number);
