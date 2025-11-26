// pages/ai-tools.page.js
import { AI_TOOLS_CURRICULUM } from "../data/ai-developments-tools.js";
import { pageTimeTracker, logEvent, flushQueue } from "../tracking.js";
import { getCurrentUser } from "../supabase.js";

export function renderAIToolsPage() {
  const app = document.querySelector("#app");
  const cur = AI_TOOLS_CURRICULUM || {};
  app.innerHTML = `
    <section class="page">
      <header>
        <button id="backBtn" class="btn small">← Back</button>
        <h1>${escape(cur.title || "AI Dev Tools")}</h1>
        <div class="meta">Hours: ${cur.totalHours ?? "-"} · Workflows: ${
    cur.totalWorkflows ?? "-"
  } · Projects: ${cur.totalProjects ?? "-"}</div>
      </header>

      <main>
        <h2>Overview</h2>
        <p>Learn modern AI-first developer tools and agentic workflows.</p>

        <h3>Curriculum Days</h3>
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

  const categoryName = "ai-tools";

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
              taskNotes: `Completed AI Tools page on ${new Date().toISOString()}`,
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
            console.error("Error saving progress (ai-tools):", e);
          }
        });
    } catch (err) {
      console.error("ai-tools tracker init error", err);
    }
  })();
}

function renderDays(days) {
  if (!Array.isArray(days)) return "<p>No days.</p>";
  return days
    .map(
      (d) => `
    <section class="day">
      <h4>Day ${escape(d.day)}: ${escape(d.title)}</h4>
      <p><strong>Topics:</strong> ${escape(
        Array.isArray(d.topics) ? d.topics.join(", ") : d.topics || ""
      )}</p>
      <p><strong>Practice:</strong> ${escape(d.practice || "")}</p>
    </section>
  `
    )
    .join("");
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
