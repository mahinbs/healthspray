-- Match order by short code (first 8, last 8, or any 6+ chars of UUID without hyphens)
CREATE OR REPLACE FUNCTION public.find_order_by_id_prefix(ref text)
RETURNS SETOF public.orders
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH cleaned AS (
    SELECT lower(regexp_replace(trim(coalesce(ref, '')), '^#', '')) AS r
  )
  SELECT o.*
  FROM public.orders o, cleaned c
  WHERE length(c.r) >= 6
    AND (
      lower(replace(o.id::text, '-', '')) LIKE '%' || replace(c.r, '-', '') || '%'
      OR lower(o.id::text) LIKE c.r || '%'
      OR lower(o.id::text) LIKE '%' || c.r
    )
  ORDER BY o.created_at DESC
  LIMIT 10;
$$;

GRANT EXECUTE ON FUNCTION public.find_order_by_id_prefix(text) TO service_role;
