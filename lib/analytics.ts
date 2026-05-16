"use client";

const VISITOR_KEY = "bs_visitor_id";
const SESSION_KEY = "bs_session_id";
const VISITOR_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days

function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function getVisitorId(): string {
  if (typeof window === "undefined") return "";
  try {
    const raw = localStorage.getItem(VISITOR_KEY);
    if (raw) {
      const { id, expires } = JSON.parse(raw);
      if (expires > Date.now()) return id;
    }
    const id = uuid();
    localStorage.setItem(VISITOR_KEY, JSON.stringify({ id, expires: Date.now() + VISITOR_TTL }));
    return id;
  } catch {
    return uuid();
  }
}

export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = uuid();
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return uuid();
  }
}

async function post(body: object) {
  try {
    await fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      keepalive: true,
    });
  } catch {
    // non-critical — swallow silently
  }
}

// Tracks a product view. Duplicate per session is handled server-side via upsert.
export function trackView(productId: string, productName: string) {
  post({
    productId,
    productName,
    sessionId: getSessionId(),
    visitorId: getVisitorId(),
    eventType: "view",
    referrer: typeof document !== "undefined" ? document.referrer : "",
  });
}

export function trackEngagement(productId: string, productName: string, eventType: "add_to_cart" | "whatsapp_click") {
  post({
    productId,
    productName,
    sessionId: getSessionId(),
    visitorId: getVisitorId(),
    eventType,
    value: 1,
  });
}
