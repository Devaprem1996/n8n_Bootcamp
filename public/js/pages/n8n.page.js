// pages/n8n.page.js
import { N8N_CURRICULUM } from "../data/n8n.js";
import { pageTimeTracker, logEvent, flushQueue } from "../tracking.js";
import { getCurrentUser } from "../services/supabase.js";

export function renderN8NPage() {
  const app = document.querySelector("#app");
  const cur = N8N_CURRICULUM || {};
  app.innerHTML = `
    <section class="page page--n8n">
      <header>
        <button id="backBtn" class="btn small">← Back</button>
        <h1>${escape(cur.title || "N8N Bootcamp")}</h1>
        <div class="meta">Total Hours: ${cur.totalHours ?? "-"} · Workflows: ${
    cur.totalWorkflows ?? "-"
  }</div>
      </header>

      <main>
        <h2>Key Dates</h2>
        <ul id="keydates">${(cur.keyDates || [])
          .map(
            (k) =>
              `<li><strong>${escape(k.date)}</strong> — ${escape(
                k.description
              )}</li>`
          )
          .join("")}</ul>

        <h2>Modules</h2>
        <div id="modules">${renderModules(cur.days)}</div>

        <div class="page-actions">
          <button id="markCompleteBtn" class="btn primary">Mark Page Complete</button>
        </div>
      </main>
    </section>
  `;

  document.getElementById("backBtn")?.addEventListener("click", async () => {
    if (tracker) await tracker.stop();
    window.history.back();
  });

  // category name used by saveProgress
  const categoryName = "n8n";

  // start tracking and wire up complete button
  let tracker;
  (async () => {
    try {
      const user = await getCurrentUser();
      const userId = user?.id ?? null;
      tracker = pageTimeTracker({ userId, page: categoryName });

      document
        .getElementById("markCompleteBtn")
        ?.addEventListener("click", async () => {
          try {
            const progressData = {
              email: user?.email || null,
              completedTasks: ["page_complete"],
              taskNotes: `Completed N8N page on ${new Date().toISOString()}`,
              progressPercent: 100,
              cohort: user?.cohort || "default",
            };

            const supa = await import("../services/supabase.js");
            if (typeof supa.saveProgress === "function") {
              const res = await supa.saveProgress(
                userId,
                categoryName,
                progressData
              );
              if (!res?.success)
                console.warn("saveProgress returned failure", res);
            } else {
              console.warn("saveProgress not exported from supabase.js");
            }

            logEvent({
              userId,
              page: categoryName,
              type: "complete",
              props: { sessionId: tracker?.sessionId },
            });
            await flushQueue().catch(() => {});

            const btn = document.getElementById("markCompleteBtn");
            if (btn) {
              btn.textContent = "Marked ✓";
              btn.disabled = true;
            }
          } catch (e) {
            console.error("Error saving progress (n8n):", e);
          }
        });
    } catch (err) {
      console.error("n8n page tracking init error", err);
    }
  })();
}

function renderModules(days = []) {
  if (!Array.isArray(days) || days.length === 0)
    return `<p>No modules yet.</p>`;
  return `<div class="modules">${days
    .map(
      (d) => `
    <article class="module">
      <h3>Day ${d.day}: ${escape(d.title)}</h3>
      <p><strong>Outcomes:</strong> ${
        Array.isArray(d.outcomes)
          ? escape(d.outcomes.join("; "))
          : escape(d.outcomes || "")
      }</p>
      <p><strong>Homework:</strong> ${escape(d.homework || "")}</p>
    </article>`
    )
    .join("")}</div>`;
}

function escape(s = "") {
  return String(s).replace(
    /[&<>"']/g,
    (m) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
        m
      ])
  );
}
