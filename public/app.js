import { fallbackSoz } from "./fallback.js";

const form = document.getElementById("form");
const input = document.getElementById("kelime");
const btn = document.getElementById("btn");
const card = document.getElementById("card");
const quote = document.getElementById("quote");
const meta = document.getElementById("meta");
const copyBtn = document.getElementById("copy");

let hitap = "yeğen";
let son = null; // { text, kelime }

document.querySelectorAll(".seg button").forEach((b) => {
  b.addEventListener("click", () => {
    hitap = b.dataset.hitap;
    document.querySelectorAll(".seg button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
  });
});

// Cümlede kelimenin geçtiği yerleri (Türkçe ekleriyle birlikte) bulur.
// "çaydanlık" → "çaydanlığı", "kitap" → "kitabı" gibi ünsüz yumuşamasını da yakalar.
const YUMUSAMA = { p: "[pb]", ç: "[çc]", t: "[td]", k: "[kğg]", g: "[gğ]" };
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
function kelimeAraliklari(text, kelime) {
  const k = kelime.toLocaleLowerCase("tr-TR");
  const son = k.slice(-1);
  const govde = k.length > 2 && YUMUSAMA[son] ? esc(k.slice(0, -1)) + YUMUSAMA[son] : esc(k);
  const re = new RegExp(`(?<![\\p{L}])${govde}[\\p{L}'’]*`, "giu");
  const lower = text.toLocaleLowerCase("tr-TR");
  const out = [];
  if (lower.length !== text.length) return out; // güvenlik: indeksler kaymasın
  for (const m of lower.matchAll(re)) out.push([m.index, m.index + m[0].length]);
  return out;
}

function parcala(text, kelime) {
  const parts = [];
  let i = 0;
  for (const [a, b] of kelimeAraliklari(text, kelime)) {
    if (a > i) parts.push({ t: text.slice(i, a) });
    parts.push({ t: text.slice(a, b), it: true });
    i = b;
  }
  if (i < text.length) parts.push({ t: text.slice(i) });
  return parts;
}

function goster(text, kelime) {
  quote.replaceChildren(
    ...parcala(text, kelime).map((p) => {
      if (!p.it) return document.createTextNode(p.t);
      const em = document.createElement("em");
      em.className = "kelime";
      em.textContent = p.t;
      return em;
    })
  );
}

const htmlEsc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

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
  son = { text, kelime: k };
  goster(text, k);
  meta.textContent = source === "yedek" ? "— Ramiz Dayı (yedek defterden)" : "— Ramiz Dayı";
  void card.offsetWidth;
  card.classList.add("show");
  copyBtn.hidden = source === "limit";
  btn.disabled = false;
  btn.textContent = "Söyle Dayı";
});

// Kopyalarken seçilen kelime italik gider:
// - zengin metin (HTML) yapıştırılan yerlerde <i> olarak,
// - düz metinde WhatsApp biçimiyle _kelime_ olarak.
copyBtn.addEventListener("click", async () => {
  if (!son) return;
  const parts = parcala(son.text, son.kelime);
  const imza = meta.textContent;
  const plain = `"${parts.map((p) => (p.it ? `_${p.t}_` : p.t)).join("")}" ${imza}`;
  const html = `"${parts.map((p) => (p.it ? `<i>${htmlEsc(p.t)}</i>` : htmlEsc(p.t))).join("").replace(/\n/g, "<br>")}" ${htmlEsc(imza)}`;
  try {
    if (window.ClipboardItem) {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/plain": new Blob([plain], { type: "text/plain" }),
          "text/html": new Blob([html], { type: "text/html" }),
        }),
      ]);
    } else {
      await navigator.clipboard.writeText(plain);
    }
    copyBtn.textContent = "Kopyalandı";
  } catch {
    try { await navigator.clipboard.writeText(plain); copyBtn.textContent = "Kopyalandı"; } catch { copyBtn.textContent = "Kopyalanamadı"; }
  }
  setTimeout(() => (copyBtn.textContent = "Kopyala"), 1500);
});
