document.addEventListener("DOMContentLoaded", () => {
  initTabs();
  loadQueue();
  initForm();
});

async function loadQueue() {
  const res = await fetch("/api/readqueue");
  const data = await res.json();
  renderAll(data);
}

function renderAll(data) {
  const reading = data.filter((i) => !i.isRead && i.isReading);
  const pending = data.filter((i) => !i.isRead && !i.isReading);
  const archived = data.filter((i) => i.isRead);

  renderSection("reading-section", reading, true);
  renderSection("pending-section", pending, true);
  renderArchive(archived);
}

function renderSection(id, items, actions) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = items
    .map(
      (item) => `
        <div class="card ${item.isReading ? "reading" : ""}">
            <h3>${item.title}</h3>
            <a href=${item.url}>Link</a>
            <div class="actions">
                <button onclick="updateStatus('${item.id}')">${item.isReading ? "Pausar" : "Leer"}</button>
                <button onclick="openScoreModal('${item.id}')">Leído</button>
            </div>
        </div>
    `,
    )
    .join("");
}

function renderArchive(items) {
  const el = document.getElementById("archive-section");
  if (!el) return;

  const scoreVal = document.getElementById("filter-score").value;
  const dateVal = document.getElementById("filter-date").value;

  let filtered = items;
  if (scoreVal) filtered = filtered.filter((i) => i.score >= scoreVal);
  if (dateVal)
    filtered = filtered.filter((i) => i.dateFinished?.startsWith(dateVal));

  el.innerHTML = filtered
    .map(
      (item) => `
        <div class="card archived">
            <h3>${item.title}</h3>
            <a href=${item.url}>Link</a>
            <p>Score: ${item.score}/10</p>
            <p><small>Leído: ${new Date(item.dateFinished).toLocaleDateString()}</small></p>
        </div>
    `,
    )
    .join("");
}

function initTabs() {
  const links = document.querySelectorAll(".tab-link");
  links.forEach((link) => {
    link.addEventListener("click", () => {
      document
        .querySelectorAll(".tab-link")
        .forEach((l) => l.classList.remove("active"));
      document
        .querySelectorAll(".tab-content")
        .forEach((c) => c.classList.add("hidden"));
      link.classList.add("active");
      document.getElementById(link.dataset.target).classList.remove("hidden");
    });
  });
}

function initForm() {
  document.getElementById("btn-open-modal").onclick = () =>
    document.getElementById("modal-form").classList.remove("hidden");
  document.getElementById("add-read-form").onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const payload = {
      title: fd.get("title"),
      url: fd.get("url"),
      isReading: fd.get("isReading") === "on",
      isRead: false,
    };
    await fetch("/api/readqueue", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    document.getElementById("modal-form").classList.add("hidden");
    e.target.reset();
    loadQueue();
  };
}

window.updateStatus = async (id) => {
  await fetch("/api/readqueue/status", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  loadQueue();
};

window.openScoreModal = (id) => {
  window.currentArticleId = id;
  document.getElementById("score-modal").classList.remove("hidden");
};

document.getElementById("btn-confirm-score").onclick = async () => {
  const score = parseInt(document.getElementById("input-score").value);
  await fetch("/api/readqueue/finish", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: window.currentArticleId, score }),
  });
  document.getElementById("score-modal").classList.add("hidden");
  loadQueue();
};

document.getElementById("filter-score").oninput = () => loadQueue();
document.getElementById("filter-date").onchange = () => loadQueue();
