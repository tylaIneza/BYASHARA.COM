// Global singleton so OTPs survive Next.js hot-reload in dev
declare global {
  // eslint-disable-next-line no-var
  var _otpStore: Map<string, { code: string; expiresAt: number }> | undefined;
}

const store: Map<string, { code: string; expiresAt: number }> =
  globalThis._otpStore ?? (globalThis._otpStore = new Map());

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function storeOtp(email: string, code: string): void {
  store.set(email.toLowerCase(), { code, expiresAt: Date.now() + OTP_TTL_MS });
}

export function verifyAndConsumeOtp(email: string, code: string): boolean {
  const entry = store.get(email.toLowerCase());
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    store.delete(email.toLowerCase());
    return false;
  }
  if (entry.code !== code.trim()) return false;
  store.delete(email.toLowerCase()); // one-time use
  return true;
}
