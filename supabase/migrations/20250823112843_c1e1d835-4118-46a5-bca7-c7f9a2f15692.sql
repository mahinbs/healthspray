-- Delete all orders (irreversible)
BEGIN;
  DELETE FROM public.orders;
COMMIT;