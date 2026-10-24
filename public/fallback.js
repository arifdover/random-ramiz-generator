// Yapay zekâ erişilemezse devreye giren yedek şablon üreticisi.
// Kelime, Türkçe ek almadan kullanılabilecek kalıplara yerleştirilir ("X denen şey", "X meselesi" gibi).

const GIRIS = [
  "Bak {h}...", "{H}, otur bakalım.", "Dinle {h}.", "{H}, bir şey söyleyeyim mi?",
  "Yaşlı adamın sözünü dinle {h}.", "{H}... şu çayı bir doldur da anlatayım.",
  "Ben bu hayatta çok şey gördüm {h}.", "Hapiste bir koğuş arkadaşım vardı {h}.",
];

const GOVDE = [
  "\"{k}\" denen şey kumar masasındaki son kart gibidir; herkes bakar ama kimse dokunmaz.",
  "\"{k}\" meselesi blöf gibidir; inanan kazanır, inanmayan da çay parasını öder.",
  "\"{k}\" dediğin şey sabır ister. Ben otuz yıl bekledim, sonunda unuttum neyi beklediğimi.",
  "\"{k}\" ile kader arasında ince bir çizgi vardır. O çizgiyi de ben çizmedim, kim çizdiyse hesabını o versin.",
  "Mahallede \"{k}\" diye bir laf dolaşırsa bil ki ya biri çok akıllıdır ya da hepimiz çok aptalız.",
  "\"{k}\" denen şeyi hafife alanı ben çok gördüm. Hepsi şimdi balık tutuyor.",
  "\"{k}\" meselesi tavla gibidir; zar senin değilse, masayı devirme hakkın saklıdır.",
  "\"{k}\" dediğin şey dost gibidir; ya sırtını yaslarsın ya da sırtından bıçaklanırsın. Arası yok.",
  "\"{k}\" yüzünden bir kere az kalsın simitçiyle kavga ediyordum. Simitçi haklıydı, o ayrı.",
  "\"{k}\" denen şey eski sevgili gibidir; hatırlarsın, gülümsersin, sonra borcunu hatırlarsın.",
  "\"{k}\" ile intikam aynı sofraya oturmaz. Oturursa da hesabı ben ödemem.",
  "\"{k}\" meselesini çözen adam ya bilgedir ya da yalancıdır. İkisi de olabilir, ben olabilirim mesela.",
];

const KAPANIS = [
  "", "", "Unutma bunu.", "Gerisini sen düşün.", "Bunu kimseye söyleme.",
  "Hayat böyle işte.", "Aklında olsun.", "Ben demiştim, dersin bir gün.",
];

const pick = (a) => a[Math.floor(Math.random() * a.length)];
const cap = (s) => s.charAt(0).toLocaleUpperCase("tr-TR") + s.slice(1);

const OZEL_KELIMELER = /(^|[^\p{L}])(akp|ak ?parti|recep|tayyip|erdo[gğ]an|cumhurba[sş]kan)/u;
export const ozelMi = (k) => OZEL_KELIMELER.test(k.toLocaleLowerCase("tr-TR"));

const OZEL = [
  "Yüce {h}, \"{k}\" lafını o kadar çok ediyorsun ki kahvehanede tavla zarları bile senin adını sayıyor. Dünya dönen bir çarktır; yarın öbür gün devran döner, sen de bu kadar ağzına aldığına üzülürsün.",
  "Yüce {h}, ben masada çok el gördüm; en sağlam görünen el bile bir gün dağılır. Sen \"{k}\" deyip duruyorsun ya, devran dönünce o kelime boğazında kılçık gibi kalmasın.",
  "Yüce {h}, \"{k}\" kelimesini sabah çayına şeker diye atıyorsun, farkında mısın? Rüzgâr bugün senden yana, ama rüzgârın tapusu olmaz. Yarın döner, sen de üzülürsün.",
];

export function fallbackSoz(hitap, kelime) {
  const fill = (s) => s.replaceAll("{h}", hitap).replaceAll("{H}", cap(hitap)).replaceAll("{k}", kelime);
  if (ozelMi(kelime)) return `${fill(pick(OZEL))}\n\nNot: Bir dost.`;
  return [fill(pick(GIRIS)), fill(pick(GOVDE)), pick(KAPANIS)].filter(Boolean).join(" ");
}
