// pages/prompt-engineering.page.js
import { PROMPT_ENG_CURRICULUM } from "../data/prompt-engineering.js";
import { pageTimeTracker, logEvent, flushQueue } from "../tracking.js";
import { getCurrentUser } from "../supabase.js";

export function renderPromptEngineeringPage() {
  const app = document.querySelector("#app");
  const cur = PROMPT_ENG_CURRICULUM || {};
  app.innerHTML = `
    <section class="page page--curriculum">
      <header class="page__header">
        <button id="backBtn" class="btn small">← Back</button>
        <h1>${escape(cur.title || "Prompt Engineering")}</h1>
        <div class="meta">
          <span>Total Hours: ${cur.totalHours ?? "-"}</span>
          <span>Workflows: ${cur.totalWorkflows ?? "-"}</span>
          <span>Projects: ${cur.totalProjects ?? "-"}</span>
        </div>
      </header>

      <article class="page__body">
        <h2>Key Dates</h2>
        <ul class="keydates">${(Array.isArray(cur.keyDates) ? cur.keyDates : [])
          .map(
            (k) =>
              `<li><strong>${escape(k.date)}</strong> — ${escape(
                k.description
              )}</li>`
          )
          .join("")}</ul>

        <h2>Curriculum</h2>
        <div id="days">${renderDays(cur.days)}</div>

        <div class="page-actions">
          <button id="markCompleteBtn" class="btn primary">Mark Page Complete</button>
        </div>
      </article>
    </section>
  `;

  document.getElementById("backBtn")?.addEventListener("click", async () => {
    if (tracker) await tracker.stop();
    window.history.back();
  });

  const categoryName = "prompt-engineering";

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
              taskNotes: `Completed Prompt Engineering page on ${new Date().toISOString()}`,
              progressPercent: 100,
              cohort: user?.cohort || "default",
            };

            const supa = await import("../supabase.js");
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
            console.error("Error saving progress (prompt-engineering):", e);
          }
        });
    } catch (err) {
      console.error("prompt-engineering tracker init error", err);
    }
  })();
}

function renderDays(days) {
  if (!Array.isArray(days) || days.length === 0)
    return `<p>No curriculum days yet.</p>`;
  return `<div class="days">
    ${days
      .map(
        (d) => `
      <section class="day">
        <h3>Day ${escape(String(d.day))}: ${escape(d.title)}</h3>
        <div class="day-meta">${escape(
          d.duration || ""
        )} · Difficulty: ${escape(String(d.difficulty || ""))}</div>
        <p><strong>Outcomes:</strong> ${escape(
          Array.isArray(d.outcomes) ? d.outcomes.join(", ") : d.outcomes || ""
        )}</p>
        <p><strong>Practice:</strong> ${escape(d.practice || "")}</p>
      </section>
    `
      )
      .join("")}
  </div>`;
}

function escapeHtml(s = "") {
  return String(s).replace(
    /[&<>"']/g,
    (m) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
        m
      ])
  );
}
function escape(s = "") {
  return escapeHtml(s);
}
