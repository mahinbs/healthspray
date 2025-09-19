interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  canMakeRequest(key: string = 'default'): boolean {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    
    if (!this.requests.has(key)) {
      this.requests.set(key, []);
    }
    
    const requestTimes = this.requests.get(key)!;
    
    // Remove old requests outside the window
    const validRequests = requestTimes.filter(time => time > windowStart);
    this.requests.set(key, validRequests);
    
    // Check if we can make a new request
    if (validRequests.length < this.config.maxRequests) {
      validRequests.push(now);
      return true;
    }
    
    return false;
  }

  getTimeUntilNextRequest(key: string = 'default'): number {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    
    if (!this.requests.has(key)) {
      return 0;
    }
    
    const requestTimes = this.requests.get(key)!.filter(time => time > windowStart);
    
    if (requestTimes.length < this.config.maxRequests) {
      return 0;
    }
    
    // Return time until the oldest request expires
    const oldestRequest = Math.min(...requestTimes);
    return oldestRequest + this.config.windowMs - now;
  }

  reset(key: string = 'default'): void {
    this.requests.delete(key);
  }

  resetAll(): void {
    this.requests.clear();
  }
}

// Create a global rate limiter for Supabase auth operations
export const supabaseRateLimiter = new RateLimiter({
  maxRequests: 10, // Maximum 10 requests
  windowMs: 60000, // Per minute
});

// Create a rate limiter for cart sync operations
// More lenient in development mode
const isDevelopment = import.meta.env.DEV;
export const cartSyncRateLimiter = new RateLimiter({
  maxRequests: isDevelopment ? 20 : 5, // More requests allowed in development
  windowMs: isDevelopment ? 10000 : 30000, // Shorter window in development
});

export default RateLimiter;
