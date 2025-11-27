// pages/vibe-coding.page.js
import { VIBE_CODING_CURRICULUM } from "../data/vibe-coding.js";
import { pageTimeTracker, logEvent, flushQueue } from "../tracking.js";
import { getCurrentUser } from "../services/supabase.js";

export function renderVibeCodingPage() {
  const app = document.querySelector("#app");
  const cur = VIBE_CODING_CURRICULUM || {};
  app.innerHTML = `
    <section class="page page--curriculum">
      <header>
        <button id="backBtn" class="btn small">← Back</button>
        <h1>${escape(cur.title || "Vibe Coding")}</h1>
        <p class="subtitle">A creative, flow-first approach to building projects.</p>
      </header>

      <main>
        <div class="info-grid">
          <div>Total Hours: ${cur.totalHours ?? "-"}</div>
          <div>Workflows: ${cur.totalWorkflows ?? "-"}</div>
          <div>Projects: ${cur.totalProjects ?? "-"}</div>
        </div>

        <h2>Days</h2>
        <div id="days">${renderDays(cur.days)}</div>

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

  const categoryName = "vibe-coding";

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
              taskNotes: `Completed Vibe Coding page on ${new Date().toISOString()}`,
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
            console.error("Error saving progress (vibe-coding):", e);
          }
        });
    } catch (err) {
      console.error("vibe-coding tracker init error", err);
    }
  })();
}

function renderDays(days = []) {
  if (!Array.isArray(days) || days.length === 0)
    return `<p>No days defined yet.</p>`;
  return `${days
    .map(
      (d) => `
    <article class="day-card">
      <h3>Day ${escape(d.day)}: ${escape(d.title)}</h3>
      <p>${escape(d.concepts || "")}</p>
      <p><strong>Practice:</strong> ${escape(d.practice || "")}</p>
    </article>`
    )
    .join("")}`;
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
