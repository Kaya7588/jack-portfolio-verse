/**
 * Telegram Mini App deep-link utilities
 * ------------------------------------
 * Drop this file into any Mini App to safely read Telegram deep-link payloads
 * and normalize them into an internal redirect path.
 *
 * Supported inputs:
 * - /onboarding?redirect=/product/123
 * - /onboarding?r=/product/123, ?next=, ?to=
 * - Telegram ?tgWebAppStartParam=... / initDataUnsafe.start_param
 * - start_param as querystring: redirect=%2Fproduct%2F123
 * - start_param as base64url JSON: { "redirect": "/product/123" }
 * - compact product aliases: product_123, product-123, p_123
 */

export type TelegramMiniApp = {
  version?: string;
  ready?: () => void;
  expand?: () => void;
  isVersionAtLeast?: (version: string) => boolean;
  initDataUnsafe?: { start_param?: string };
  BackButton?: {
    show: () => void;
    hide: () => void;
    onClick: (cb: () => void) => void;
    offClick: (cb: () => void) => void;
  };
  HapticFeedback?: {
    impactOccurred: (style: "light" | "medium" | "heavy" | "rigid" | "soft") => void;
    selectionChanged: () => void;
    notificationOccurred: (type: "success" | "warning" | "error") => void;
  };
  viewportStableHeight?: number;
  onEvent?: (ev: string, cb: () => void) => void;
  offEvent?: (ev: string, cb: () => void) => void;
  setHeaderColor?: (c: string) => void;
  setBackgroundColor?: (c: string) => void;
};

type TelegramWindow = Window & {
  Telegram?: { WebApp?: TelegramMiniApp };
};

export type DeepLinkResolution = {
  redirect: string;
  source: "query" | "telegram_start_param" | "fallback";
  rawStartParam?: string;
};

const REDIRECT_KEYS = ["redirect", "r", "next", "to", "path"];

export function getTelegramMiniApp(): TelegramMiniApp | null {
  if (typeof window === "undefined") return null;
  return (window as TelegramWindow).Telegram?.WebApp ?? null;
}

export function isTelegramVersionAtLeast(tg: TelegramMiniApp | null, version: string): boolean {
  if (!tg) return false;
  try {
    if (typeof tg.isVersionAtLeast === "function") return tg.isVersionAtLeast(version);
  } catch {
    return false;
  }
  return false;
}

export function isSafeInternalRedirect(value: string | undefined | null): boolean {
  if (!value || typeof value !== "string") return false;
  if (!value.startsWith("/") || value.startsWith("//")) return false;
  if (/^\/\\/u.test(value)) return false;
  if (/^[a-z][a-z0-9+.-]*:/iu.test(value)) return false;
  return true;
}

function safeDecodeURIComponent(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function decodeBase64Url(value: string): string | null {
  try {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    if (typeof atob === "function") return atob(padded);
    return null;
  } catch {
    return null;
  }
}

function redirectFromParams(params: URLSearchParams): string | null {
  for (const key of REDIRECT_KEYS) {
    const value = params.get(key);
    if (isSafeInternalRedirect(value)) return value;
    const decoded = value ? safeDecodeURIComponent(value) : null;
    if (isSafeInternalRedirect(decoded)) return decoded;
  }
  return null;
}

function redirectFromJson(value: string): string | null {
  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;
    for (const key of REDIRECT_KEYS) {
      const candidate = parsed[key];
      if (typeof candidate === "string" && isSafeInternalRedirect(candidate)) return candidate;
    }
  } catch {
    return null;
  }
  return null;
}

function redirectFromCompactAlias(value: string): string | null {
  const decoded = safeDecodeURIComponent(value).trim();
  if (isSafeInternalRedirect(decoded)) return decoded;

  const productMatch = decoded.match(/^(?:product|p)[_-]([a-z0-9-]{1,80})$/iu);
  if (productMatch?.[1]) return `/product/${productMatch[1]}`;

  const redirectPrefix = decoded.match(/^redirect[_-](.+)$/iu);
  const payload = redirectPrefix?.[1];
  if (payload) {
    const direct = safeDecodeURIComponent(payload);
    if (isSafeInternalRedirect(direct)) return direct;
    const b64 = decodeBase64Url(payload);
    if (b64 && isSafeInternalRedirect(b64)) return b64;
    if (b64) return redirectFromJson(b64);
  }

  return null;
}

export function redirectFromStartParam(startParam: string | undefined | null): string | null {
  if (!startParam) return null;
  const raw = startParam.trim();
  if (!raw) return null;

  const decoded = safeDecodeURIComponent(raw);
  const direct = redirectFromCompactAlias(decoded);
  if (direct) return direct;

  const queryLike = decoded.includes("=") ? decoded : decoded.replace(/^\?/u, "");
  const fromQuery = redirectFromParams(new URLSearchParams(queryLike));
  if (fromQuery) return fromQuery;

  const fromJson = redirectFromJson(decoded);
  if (fromJson) return fromJson;

  const b64 = decodeBase64Url(raw);
  if (b64) {
    const b64Direct = redirectFromCompactAlias(b64);
    if (b64Direct) return b64Direct;
    const b64Query = redirectFromParams(new URLSearchParams(b64));
    if (b64Query) return b64Query;
    const b64Json = redirectFromJson(b64);
    if (b64Json) return b64Json;
  }

  return null;
}

export function resolveTelegramDeepLink(fallback = "/"): DeepLinkResolution {
  const safeFallback = isSafeInternalRedirect(fallback) ? fallback : "/";
  if (typeof window === "undefined") return { redirect: safeFallback, source: "fallback" };

  const params = new URLSearchParams(window.location.search);
  const queryRedirect = redirectFromParams(params);
  if (queryRedirect) return { redirect: queryRedirect, source: "query" };

  const tgStartParam = getTelegramMiniApp()?.initDataUnsafe?.start_param;
  const urlStartParam = params.get("tgWebAppStartParam") ?? params.get("startapp") ?? params.get("start_param");
  const rawStartParam = tgStartParam ?? urlStartParam ?? undefined;
  const startRedirect = redirectFromStartParam(rawStartParam);
  if (startRedirect) {
    return { redirect: startRedirect, source: "telegram_start_param", rawStartParam };
  }

  return { redirect: safeFallback, source: "fallback", rawStartParam };
}

export function safeTelegramHaptic(kind: "select" | "light" | "medium" | "success") {
  const tg = getTelegramMiniApp();
  const h = tg?.HapticFeedback;
  if (h && isTelegramVersionAtLeast(tg, "6.1")) {
    try {
      if (kind === "select") h.selectionChanged();
      else if (kind === "success") h.notificationOccurred("success");
      else h.impactOccurred(kind);
      return;
    } catch {
      /* fall through to vibration */
    }
  }

  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    const map = { select: 8, light: 10, medium: 18, success: [12, 40, 18] } as const;
    try {
      navigator.vibrate(map[kind] as number | number[]);
    } catch {
      /* noop */
    }
  }
}
