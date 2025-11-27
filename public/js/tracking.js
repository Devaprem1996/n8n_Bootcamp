// tracking.js
// Lightweight tracking helper (batched, local-queue, offline tolerant).
// Loaded from /js/tracking.js inside the public folder.

import { initSupabase } from "./services/supabase.js";

// small UUID generator (v4)
function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

let SESSION_ID = uuidv4();
const EVENT_QUEUE_KEY = "perf_event_queue_v1";
let eventQueue = JSON.parse(localStorage.getItem(EVENT_QUEUE_KEY) || "[]");

function persistQueue() {
  try {
    localStorage.setItem(EVENT_QUEUE_KEY, JSON.stringify(eventQueue));
  } catch (e) {
    console.warn("persistQueue error", e);
  }
}

function enqueueEvent(ev) {
  eventQueue.push(ev);
  persistQueue();
  // flush earlier if queue grows
  if (eventQueue.length >= 12) flushQueue().catch(() => {});
}

// flush queue to Supabase (batched)
export async function flushQueue() {
  if (eventQueue.length === 0) return;
  const toSend = eventQueue.splice(0, eventQueue.length);
  persistQueue();

  try {
    const sb = await initSupabase();
    // convert events into page_events rows
    const rows = toSend.map((e) => ({
      user_id: e.userId || null,
      page: e.page,
      event_type: e.type,
      event_props: e.props || {},
      ts: e.ts || new Date().toISOString(),
    }));
    const { error } = await sb.from("page_events").insert(rows);
    if (error) {
      console.error("tracking flush error", error);
      // rollback to queue
      eventQueue = toSend.concat(eventQueue);
      persistQueue();
    }
  } catch (err) {
    console.error("tracking flush fail", err);
    eventQueue = toSend.concat(eventQueue);
    persistQueue();
  }
}

// log a generic event
export function logEvent({ userId, page, type, props }) {
  const ev = {
    userId: userId || null,
    page,
    type,
    props: props || {},
    ts: new Date().toISOString(),
  };
  enqueueEvent(ev);
}

// Page time tracker: handles visibility and beforeunload
export function pageTimeTracker({ userId, page }) {
  let start = document.hidden ? null : Date.now();
  let accumulated = 0;

  function onVisibilityChange() {
    if (!document.hidden) {
      // resumed
      start = Date.now();
    } else {
      if (start) {
        accumulated += Math.round((Date.now() - start) / 1000);
        start = null;
      }
    }
  }

  async function onBeforeUnload() {
    if (start) {
      accumulated += Math.round((Date.now() - start) / 1000);
      start = null;
    }

    // enqueue activity log as an event (server-side can aggregate into activity_logs)
    enqueueEvent({
      userId,
      page,
      type: "activity_log",
      props: { duration_seconds: accumulated, sessionId: SESSION_ID },
      ts: new Date().toISOString(),
    });

    // log exit event
    enqueueEvent({
      userId,
      page,
      type: "exit",
      props: { duration_seconds: accumulated, sessionId: SESSION_ID },
      ts: new Date().toISOString(),
    });

    // try flushing (best-effort)
    try {
      await flushQueue();
    } catch (e) {
      /* swallow */
    }
  }

  document.addEventListener("visibilitychange", onVisibilityChange);
  window.addEventListener("beforeunload", onBeforeUnload);
  window.addEventListener("pagehide", onBeforeUnload); // mobile friendly

  // record enter
  enqueueEvent({
    userId,
    page,
    type: "enter",
    props: { sessionId: SESSION_ID },
    ts: new Date().toISOString(),
  });

  // periodic flush every 20s (background)
  const interval = setInterval(() => {
    flushQueue().catch(() => {});
  }, 20000);

  return {
    stop: async () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("beforeunload", onBeforeUnload);
      window.removeEventListener("pagehide", onBeforeUnload);
      clearInterval(interval);
      // final flush
      await onBeforeUnload();
    },
    sessionId: SESSION_ID,
    getAccumulated: () => accumulated,
  };
}

// expose a manual activity log insertion (useful if you prefer a dedicated table)
export function enqueueActivityLog({ userId, page, duration_seconds }) {
  enqueueEvent({
    userId,
    page,
    type: "activity_log",
    props: { duration_seconds, sessionId: SESSION_ID },
    ts: new Date().toISOString(),
  });
}

// try an initial flush on load if network available
if (navigator.onLine) {
  flushQueue().catch(() => {});
}

window.addEventListener("online", () => {
  flushQueue().catch(() => {});
});
window.addEventListener("offline", () => {
  flushQueue().catch(() => {});
});

