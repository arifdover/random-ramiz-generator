import { fallbackSoz } from "./fallback.js";

const form = document.getElementById("form");
const input = document.getElementById("kelime");
const btn = document.getElementById("btn");
const card = document.getElementById("card");
const quote = document.getElementById("quote");
const meta = document.getElementById("meta");
const copyBtn = document.getElementById("copy");

let hitap = "yeğen";
document.querySelectorAll(".seg button").forEach((b) => {
  b.addEventListener("click", () => {
    hitap = b.dataset.hitap;
    document.querySelectorAll(".seg button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
  });
});

async function uret(h, k) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 15000);
  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ hitap: h, kelime: k }),
      signal: ctrl.signal,
    });
    if (res.status === 429) return { text: "Yavaş ol " + h + "... Acele eden kaybeder. Bir dakika bekle.", source: "limit" };
    if (!res.ok) throw new Error(String(res.status));
    const data = await res.json();
    if (!data.text) throw new Error("empty");
    return data;
  } catch {
    return { text: fallbackSoz(h, k), source: "yedek" };
  } finally {
    clearTimeout(t);
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const k = input.value.trim().replace(/\s+/g, " ");
  if (!k) { input.focus(); return; }

  btn.disabled = true;
  btn.textContent = "Dayı düşünüyor...";
  card.classList.remove("show");
  card.classList.add("thinking");
  copyBtn.hidden = true;

  const { text, source } = await uret(hitap, k);

  card.classList.remove("thinking");
  quote.textContent = text;
  meta.textContent = source === "yedek" ? "— Ramiz Dayı (yedek defterden)" : "— Ramiz Dayı";
  void card.offsetWidth;
  card.classList.add("show");
  copyBtn.hidden = source === "limit";
  btn.disabled = false;
  btn.textContent = "Söyle Dayı";
});

copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(`"${quote.textContent}" ${meta.textContent}`);
    copyBtn.textContent = "Kopyalandı";
    setTimeout(() => (copyBtn.textContent = "Kopyala"), 1500);
  } catch {}
});
