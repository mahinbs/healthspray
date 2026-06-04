/** Public order reference shown on invoices/receipts (last 8 chars of UUID). */
export function formatOrderReference(orderId: string): string {
  return orderId.slice(-8).toUpperCase();
}

export function normalizeOrderRefInput(input: string): string {
  return input.trim().replace(/^#/, '').replace(/-/g, '').toLowerCase();
}

export function orderIdMatchesReference(orderId: string, refInput: string): boolean {
  const ref = normalizeOrderRefInput(refInput);
  if (ref.length < 6) return false;
  const idCompact = orderId.replace(/-/g, '').toLowerCase();
  const idLower = orderId.toLowerCase();
  return (
    idCompact.includes(ref) ||
    idLower.startsWith(ref) ||
    idLower.endsWith(ref) ||
    idCompact.endsWith(ref) ||
    idCompact.startsWith(ref)
  );
}
