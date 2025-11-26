// public/js/pages/notfound.page.js
export function renderNotFound() {
  const app = document.querySelector("#app");
  if (!app) {
    console.warn("renderNotFound: #app not found");
    return;
  }

  app.innerHTML = `
    <main style="display:flex;align-items:center;justify-content:center;height:70vh;padding:24px;">
      <div style="max-width:700px;text-align:center;">
        <h1 style="font-size:clamp(28px,6vw,48px);margin:0 0 12px;">404 — Page not found</h1>
        <p style="color:#6b7280;margin:0 0 20px;">
          The page you were looking for doesn't exist or was moved.
        </p>
        <div style="display:flex;gap:8px;justify-content:center;">
          <button id="nf-back" class="btn">Go back</button>
          <button id="nf-home" class="btn primary">Home</button>
        </div>
      </div>
    </main>
  `;

  document
    .getElementById("nf-back")
    ?.addEventListener("click", () => window.history.back());
  document.getElementById("nf-home")?.addEventListener("click", () => {
    // navigate to root using hash if app uses hash or pathname otherwise
    if (window.location.hash) window.location.hash = "/";
    else window.location.pathname = "/";
    // If you have a navigateTo() global, you can call it:
    if (typeof window.navigateTo === "function") window.navigateTo("/");
  });
}
