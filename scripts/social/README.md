# Sociale medier: automatisk indhold

Hver uge laves 3 opslag (mandag, onsdag, fredag kl. 19.00) og 3 reels (samme dage kl. 19.10).
Indholdet lægges i indholdskalenderen i Google Sheets, og Make poster det på Instagram og Facebook.

- Kalender: [Webleads indholdskalender](https://docs.google.com/spreadsheets/d/1Xym5aLyCBlyNdFeZIep-lNPaBD5qZ_40oFXPjhtgQGI/edit), fanen `Kalender`
- Make: scenariet "Webleads | Indholdskalender → Instagram + Facebook" tjekker kalenderen hver time kl. :00 mellem 08.00 og 21.00 (14 tjek om dagen, 1 credit pr. tjek)
- Medier: skal ligge i repoet under `brand/social/` og være pushet til `main`, så de er offentlige på `https://webleads.dk/brand/social/...` (Instagram kan kun hente fra en offentlig URL)

## Filer

| Mappe | Indhold |
|---|---|
| `scripts/social/opslag/NN-navn.html` | Skabelon for opslag NN (1080 × 1350) |
| `scripts/social/reels/story-NN-navn.html` + `base.css` | Skabelon for reel NN (1080 × 1920, CSS-animation) |
| `brand/social/posts/NN-navn.png` | Færdigt opslag |
| `brand/social/stories/story-NN-navn.mp4` | Færdig reel |
| `brand/social/posts/TEKSTER.md` | Instagram-tekster |
| `brand/social/facebook/FACEBOOK.md` | Facebook-tekster |

```bash
node scripts/social/render-opslag.mjs scripts/social/opslag/13-navn.html    # PNG + grid-preview, fejler ved OVERFLOW
node scripts/social/render-reel.mjs scripts/social/reels/story-13-navn.html 9  # MP4, 9 sek.
```

## Stil

- Byg altid videre på en eksisterende skabelon: samme CSS, fonte (Bricolage Grotesque 800 til overskrifter, DM Sans til tekst), logo og bundlinje med `webleads.dk`.
- Farver: orange `#e0552b`, sort `#111`, sand `#f2ede4`. Aldrig andre baggrunde.
- Farverækkefølge (gitteret danner diagonaler): opslag nr. `n` får farven `["orange","black","sand"][((n-1)%3 - floor((n-1)/3)) mod 3]`.
  13 sand, 14 orange, 15 sort · 16 sort, 17 sand, 18 orange · 19 orange, 20 sort, 21 sand · og så forfra.
- Reels: overskriften står der fra første billede (ingen animation på `.line`), resten animerer ind (`a-fade`, `a-pop`), slut med CTA og logo. 8–10 sek.
- Korte sætninger, dansk, du-form. Ingen tankestreger som pynt. Ingen emojis i billederne.

## Fakta: brug kun det, der står på webleads.dk

Læs `index.html` før du skriver. Fakta der må bruges: hjemmeside fra 3.000 kr. ekskl. moms, betales én gang, klar på 7 dage, ingen binding, du ejer siden, hvad der er med i prisen, tilvalg og priser (SEO og annoncering fra 999 kr./md., interne systemer fra 14.999 kr., automations fra 4.999 kr.), teamet (Alexander, Malthe, Anna, Mikkel), processen i 3 trin, FAQ-svarene.
Opfind aldrig kunder, anmeldelser, resultater, tal eller cases. Referencesiden er demodata og må ikke citeres.

## Tekster

Instagram: krog i første linje, 3–6 korte linjer, CTA "↓ Gratis tilbud via linket i bio." og 5–9 hashtags til sidst (altid `#webleads`).
Facebook: samme tekst, men CTA med klikbart link `https://webleads.dk/?utm_source=facebook&utm_medium=social&utm_campaign=opslag` (+ `#kontakt`, `#pris`, `#tilvalg` eller `#teamet`) og 2–3 hashtags.
Reels: kortere tekst end opslaget samme dag, samme CTA som Instagram.

## Kalenderen

Kolonner: `ID | Dato | Tid | Type | Kanal | Medie-URL | Tekst Instagram | Tekst Facebook | Status | Postet | Post-ID | Note | Tidspunkt (auto)`

- `Dato` som `2026-10-19`, `Tid` som `19:00`.
- `Type`: `Opslag` eller `Reel`. `Kanal`: `Instagram + Facebook` for opslag, `Instagram` for reels.
- `Status`: `Klar` (Make poster, når tidspunktet er nået) · `Sender` (Make er i gang, eller det fejlede midtvejs) · `Postet` · `Fejl` · `Pause` (springes over).
- Skriv aldrig i kolonne M. Den er en formel.
- Find første tomme række ud fra kolonne A og skriv dér (ikke append, formlen i M fylder kolonnen).
- Regnearket er dansk: formler bruger semikolon og danske funktionsnavne.

## Begrænsninger

Instagrams API kan ikke lave stories, link-stickers eller musik fra Instagrams bibliotek. Derfor bliver de animerede videoer lagt op som reels (kun under Reels-fanen, ikke i gitteret). Vil du have dem som story med link-sticker, skal det gøres i appen.
