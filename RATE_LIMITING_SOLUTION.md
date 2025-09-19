# Rate Limiting Solution for Supabase 429 Errors

## Problem
The application was experiencing infinite loops of cart syncing operations, causing Supabase to return 429 (Too Many Requests) errors. This was happening because:

1. Cart items would change
2. `useEffect` would trigger cart sync
3. Supabase auth would update user metadata
4. This would trigger auth state changes
5. Which would trigger more cart operations
6. Creating an infinite loop

## Solution Implemented

### 1. Rate Limiting Utility (`src/lib/rateLimiter.ts`)
- Created a `RateLimiter` class to track API requests
- Implemented sliding window rate limiting
- Created specific rate limiters for different operations:
  - `supabaseRateLimiter`: 10 requests per minute
  - `cartSyncRateLimiter`: 5 requests per 30 seconds (20 requests per 10 seconds in development)

### 2. Cart Context Improvements (`src/contexts/CartContext.tsx`)
- **Debouncing**: Added 500ms debounce to cart sync operations
- **Cooldown Period**: 2-second cooldown between syncs
- **Change Detection**: Only sync when cart data actually changes
- **Error Handling**: Extended cooldown periods on rate limit errors
- **Backup Storage**: Store cart locally when rate limited

### 3. API Service Improvements (`src/services/api.ts`)
- **Rate Limit Checking**: Check rate limits before making requests
- **Change Detection**: Skip updates when cart hasn't changed
- **Better Error Handling**: Re-throw errors for proper handling

### 4. Key Features

#### Debouncing
```typescript
// Clear any pending sync
if (syncTimeoutRef.current) {
  clearTimeout(syncTimeoutRef.current);
}

// Debounce the sync to avoid rapid successive calls
syncTimeoutRef.current = setTimeout(() => {
  syncCartWithBackend();
}, 500); // 500ms debounce
```

#### Rate Limiting
```typescript
// Check rate limiting before making the request
if (!cartSyncRateLimiter.canMakeRequest('cart-sync')) {
  const timeUntilNext = cartSyncRateLimiter.getTimeUntilNextRequest('cart-sync');
  throw new Error(`Rate limit exceeded. Try again in ${Math.ceil(timeUntilNext / 1000)} seconds.`);
}
```

#### Change Detection
```typescript
// Check if cart data has actually changed
const currentCartData = JSON.stringify(state.items);
if (currentCartData === lastCartDataRef.current) {
  return; // No change, skip sync
}
```

#### Adaptive Cooldown
```typescript
// Handle rate limiting more aggressively
if (error?.message?.includes('rate limit') || error?.status === 429) {
  console.warn('Rate limit hit, extending cooldown period');
  lastSyncRef.current = now + 10000; // 10 seconds cooldown
}
```

## Benefits

1. **Prevents Infinite Loops**: Multiple safeguards prevent rapid successive API calls
2. **Graceful Degradation**: Cart continues to work locally even when rate limited
3. **Better User Experience**: No more constant error messages
4. **Development Friendly**: More lenient limits in development mode
5. **Scalable**: Rate limiting can be easily adjusted for production

## Usage

The solution is automatically applied to all cart operations. For manual sync operations, use:

```typescript
const { forceSyncCart } = useCart();

// Force sync (bypasses rate limiting)
await forceSyncCart();
```

## Configuration

Rate limits can be adjusted in `src/lib/rateLimiter.ts`:

```typescript
export const cartSyncRateLimiter = new RateLimiter({
  maxRequests: isDevelopment ? 20 : 5, // Adjust as needed
  windowMs: isDevelopment ? 10000 : 30000, // Adjust as needed
});
```

## Monitoring

The solution includes console logging for debugging:
- Rate limit warnings
- Sync skipping messages
- Error details with cooldown extensions

This should completely resolve the 429 errors while maintaining full cart functionality.
