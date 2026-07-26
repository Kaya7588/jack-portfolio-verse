/**
 * Lightweight onboarding analytics.
 * - Pushes events to window.dataLayer (GA4 / GTM ready)
 * - Emits a CustomEvent("arya:analytics") so any provider can subscribe
 * - Sends to Telegram.WebApp.sendData when running inside Telegram
 * - Buffers to sessionStorage so drop-off can be replayed
 * - Console-logs in dev
 */

export type AryaEvent =
  | "onboarding_start"
  | "onboarding_step_view"
  | "onboarding_step_next"
  | "onboarding_step_back"
  | "onboarding_feature_swipe"
  | "onboarding_select_language"
  | "onboarding_select_theme"
  | "onboarding_select_currency"
  | "onboarding_complete"
  | "onboarding_dropoff";

type Props = Record<string, string | number | boolean | null | undefined>;

const SESSION_KEY = "arya.analytics.session.v1";
const BUFFER_KEY = "arya.analytics.buffer.v1";

function sessionId(): string {
  if (typeof window === "undefined") return "ssr";
  try {
    let id = window.sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
      window.sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "anon";
  }
}

function pushBuffer(payload: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.sessionStorage.getItem(BUFFER_KEY);
    const arr: unknown[] = raw ? JSON.parse(raw) : [];
    arr.push(payload);
    // cap buffer
    if (arr.length > 200) arr.splice(0, arr.length - 200);
    window.sessionStorage.setItem(BUFFER_KEY, JSON.stringify(arr));
  } catch {
    /* noop */
  }
}

export function track(event: AryaEvent, props: Props = {}) {
  const payload = {
    event,
    session_id: sessionId(),
    ts: Date.now(),
    path: typeof location !== "undefined" ? location.pathname : "",
    ...props,
  };

  // GA4 / GTM
  if (typeof window !== "undefined") {
    const w = window as unknown as { dataLayer?: unknown[] };
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push(payload);

    // Generic subscriber hook
    try {
      window.dispatchEvent(new CustomEvent("arya:analytics", { detail: payload }));
    } catch {
      /* noop */
    }

    // Telegram bot side
    const tg = (window as unknown as { Telegram?: { WebApp?: { sendData?: (s: string) => void } } })
      .Telegram?.WebApp;
    try {
      tg?.sendData?.(JSON.stringify({ kind: "analytics", ...payload }));
    } catch {
      /* noop */
    }

    if (import.meta.env?.DEV) {
      // eslint-disable-next-line no-console
      console.debug("[arya:analytics]", payload);
    }
  }

  pushBuffer(payload);
}

export function readBuffer(): Record<string, unknown>[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(BUFFER_KEY);
    return raw ? (JSON.parse(raw) as Record<string, unknown>[]) : [];
  } catch {
    return [];
  }
}
