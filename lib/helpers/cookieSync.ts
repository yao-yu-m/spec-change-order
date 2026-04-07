/**
 * Cookie-based CO persistence helpers.
 *
 * On serverless deployments (Vercel) the in-memory store resets between Lambda
 * invocations.  We work around this by serialising the full ChangeOrder into a
 * short-lived cookie on every mutating API response, and re-hydrating the store
 * from that cookie at the start of every API request / server-component render.
 *
 * Two surfaces:
 *   – API routes  (NextRequest / NextResponse)  → restoreCOFromCookie / attachCOCookie
 *   – Server-component pages (next/headers)      → getCoOrFallback
 */

import type { NextRequest, NextResponse } from "next/server";
import type { ChangeOrder } from "@/lib/domain/types";
import { changeOrderStore } from "@/lib/data/store";
import { ensureSeeded } from "@/lib/data/store";

const COOKIE_MAX_AGE = 60 * 60 * 2; // 2 hours

// ── API-route helpers ──────────────────────────────────────────────────────

/** If the CO isn't in the store, try to restore it from the request cookie. */
export function restoreCOFromCookie(req: NextRequest, id: string): void {
  ensureSeeded();
  if (changeOrderStore.find((c) => c.id === id)) return;
  try {
    const raw = req.cookies.get(`co-${id}`)?.value;
    if (!raw) return;
    const co = JSON.parse(raw) as ChangeOrder;
    if (co?.id) changeOrderStore.push(co);
  } catch {}
}

/** Attach the latest CO state to the response so the next request can restore it. */
export function attachCOCookie(res: NextResponse, co: ChangeOrder): void {
  try {
    res.cookies.set(`co-${co.id}`, JSON.stringify(co), {
      maxAge: COOKIE_MAX_AGE,
      path: "/",
      sameSite: "lax",
      httpOnly: false,
    });
  } catch {}
}

// ── Server-component helper (uses next/headers) ────────────────────────────

/**
 * Look up a ChangeOrder: store first, cookie fallback second.
 * Call this from server-component pages instead of ChangeOrderService directly.
 * Must only be called during server-component rendering (not in client components).
 */
export async function getCoOrFallback(id: string): Promise<ChangeOrder | undefined> {
  ensureSeeded();
  const inStore = changeOrderStore.find((c) => c.id === id);
  if (inStore) return inStore;

  try {
    // Dynamic import keeps next/headers out of the module graph at build time
    const { cookies } = await import("next/headers");
    const raw = cookies().get(`co-${id}`)?.value;
    if (!raw) return undefined;
    const co = JSON.parse(raw) as ChangeOrder;
    if (co?.id) {
      changeOrderStore.push(co); // re-seed for this invocation
      return co;
    }
  } catch {}
  return undefined;
}
