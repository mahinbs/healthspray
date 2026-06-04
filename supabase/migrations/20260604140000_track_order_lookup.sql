-- Lookup guest orders by short ID prefix (first 8 chars shown on receipts)
CREATE OR REPLACE FUNCTION public.find_order_by_id_prefix(prefix text)
RETURNS SETOF public.orders
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT *
  FROM public.orders
  WHERE id::text ILIKE prefix || '%'
  LIMIT 2;
$$;

GRANT EXECUTE ON FUNCTION public.find_order_by_id_prefix(text) TO service_role;
