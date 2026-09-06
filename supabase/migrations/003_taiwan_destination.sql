begin;
do $$ declare rule text; begin
 select pg_get_expr(conbin,conrelid) into rule from pg_constraint where conrelid='public.city_visits'::regclass and conname='city_visits_city_id_check';
 if rule is null then raise exception 'City whitelist constraint missing'; end if;
 if position('710000' in rule)=0 then
 alter table public.city_visits drop constraint city_visits_city_id_check;
 execute format('alter table public.city_visits add constraint city_visits_city_id_check check ((%s) or city_id = %L)',rule,'710000');
 end if;
end $$;
commit;
