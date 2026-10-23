# Random Ramiz Generator

Ezel dizisindeki Ramiz Dayı'nın üslubunda, kullanıcının verdiği kelimeyle tamamen özgün, komik "özdeyişler" üreten küçük bir web sitesi.

- Hitap seçilir (**Yeğen / Kardeş**), bir kelime yazılır, Ramiz Dayı konuşur.
- Cümleleri Google Gemini (ücretsiz katman) üretir. API anahtarı Cloudflare Worker içinde gizli tutulur.
- Gemini'ye ulaşılamazsa site, şablonlu "yedek defter" ile cevap vermeye devam eder.

## Yapı

```
public/        → site (index.html, style.css, app.js, fallback.js)
worker/        → Cloudflare Worker: /api/generate → Gemini
wrangler.toml  → Cloudflare ayarları (model listesi burada)
```

## Kurulum (bir kerelik, ücretsiz)

1. **Gemini API anahtarı**: https://aistudio.google.com/apikey adresinden Google hesabınla "Create API key" ile anahtar al. Kart gerekmez.
2. **Cloudflare hesabı**: https://dash.cloudflare.com adresinden ücretsiz hesap aç.
3. Cloudflare panelinde **Workers & Pages → Create → Import a repository** adımlarını izle. GitHub'ı bağla ve `random-ramiz-generator` reposunu seç. Ayarları varsayılan bırakıp **Deploy** de. Cloudflare `wrangler.toml` dosyasını kendisi okur.
4. Deploy bitince Worker'ın **Settings → Variables and Secrets** bölümünden **Add** ile şunu ekle: tür **Secret**, ad `GEMINI_API_KEY`, değer 1. adımdaki anahtar. Kaydet.
5. Site `https://random-ramiz-generator.<hesap-adın>.workers.dev` adresinde çalışır. Repoya her push'ta otomatik yeniden yayınlanır.

## Ayarlar

- `wrangler.toml` içindeki `GEMINI_MODELS`, sırayla denenen model listesidir. Biri kotaya takılırsa sıradakine geçer.
- Kötüye kullanıma karşı IP başına dakikada 8 istek sınırı vardır (`worker/index.js` → `RATE`).
- Üslup talimatı `worker/index.js` içindeki `SYSTEM_PROMPT`, yedek şablonlar ise `public/fallback.js` içindedir.

> Şaka amaçlı hayran projesidir. Üretilen sözler dizide geçmez.
