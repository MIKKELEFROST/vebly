# Sociale medier: automatisk indhold

Hver uge laves 3 opslag (mandag, onsdag, fredag kl. 19.00) og 3 reels (samme dage kl. 20.00).

**Regel: Vi poster kun mellem kl. 08.00 og 21.00, og kun på hele timer.** Make tjekker kalenderen hver hele time i det tidsrum, så et opslag sat til fx 19.10 ville først gå ud kl. 20.00.
Indholdet lægges i indholdskalenderen i Google Sheets, og Make poster det på Instagram og Facebook.

- Kalender: [Webleads indholdskalender](https://docs.google.com/spreadsheets/d/1Xym5aLyCBlyNdFeZIep-lNPaBD5qZ_40oFXPjhtgQGI/edit), fanen `Kalender`
- Make: scenariet "Webleads | Indholdskalender → Instagram + Facebook" tjekker kalenderen hver time kl. :00 mellem 08.00 og 21.00 (14 tjek om dagen, 1 credit pr. tjek)
- Medier: skal ligge i repoet under `brand/social/` og være pushet til `main`, så de er offentlige på `https://webleads.dk/brand/social/...` (Instagram kan kun hente fra en offentlig URL)

## Filer

| Mappe | Indhold |
|---|---|
| `scripts/social/opslag/NN-navn.html` | Skabelon for opslag NN (1080 × 1350). En karrusel har flere `.p` i samme fil, én pr. slide |
| `scripts/social/reels/story-NN-navn.html` + `base.css` | Skabelon for reel NN (1080 × 1920, CSS-animation) |
| `brand/social/posts/NN-navn.png` | Færdigt opslag (for en karrusel: første slide, til grid-preview) |
| `brand/social/karruseller/NN-navn/01.jpg …` | Slides til en karrusel (JPG, 2–10 stk.) |
| `brand/social/stories/story-NN-navn.mp4` | Færdig reel |
| `brand/social/posts/TEKSTER.md` | Instagram-tekster |
| `brand/social/facebook/FACEBOOK.md` | Facebook-tekster |

```bash
node scripts/social/render-opslag.mjs scripts/social/opslag/13-navn.html    # PNG + grid-preview, fejler ved OVERFLOW
node scripts/social/render-karrusel.mjs scripts/social/opslag/17-navn.html  # JPG-slides + forside-PNG, fejler ved OVERFLOW eller under 2/over 10 slides
node scripts/social/render-reel.mjs scripts/social/reels/story-13-navn.html 9  # MP4, 9 sek.
```

## Stil

- Byg altid videre på en eksisterende skabelon: samme CSS, fonte (Bricolage Grotesque 800 til overskrifter, DM Sans til tekst), logo og bundlinje med `webleads.dk`.
- Farver: orange `#e0552b`, sort `#111`, sand `#f2ede4`. Aldrig andre baggrunde.
- Farverækkefølge (gitteret danner diagonaler): opslag nr. `n` får farven `["orange","black","sand"][((n-1)%3 - floor((n-1)/3)) mod 3]`.
  13 sand, 14 orange, 15 sort · 16 sort, 17 sand, 18 orange · 19 orange, 20 sort, 21 sand · og så forfra.
- Reels: overskriften står der fra første billede (ingen animation på `.line`), resten animerer ind (`a-fade`, `a-pop`), slut med CTA og logo. 8–10 sek.
- Korte sætninger, dansk, du-form. Ingen tankestreger som pynt. Ingen emojis i billederne.

## Emner: gentag aldrig noget, der er postet

Læs overskrifterne i `brand/social/posts/TEKSTER.md` og kalenderen, før du vælger et emne. Et nyt opslag, en karrusel eller en reel må ikke have samme emne eller budskab som noget, der er postet eller planlagt.
Brugt: intro, alt er med i prisen, sådan virker det (3 trin), før/efter, vores løfte, hvorfor Webleads, tilvalg med priser, teamet, månedlig betaling, alle fag, alt under ét tag, tjek din side, ingen tid (15 min.), findes på Google, ret selv i siden, content, automations, rettelser før lancering, annoncering.
Ikke brugt endnu: interne systemer (CRM, booking, dashboards), SEO som månedligt tilvalg, mail på eget domæne og flytning af den gamle side, webshop og gavekort, logo, AI-chatbot, de enkelte i teamet.

## Fakta: brug kun det, der står på webleads.dk

Læs `index.html` før du skriver. Fakta der må bruges: hjemmeside fra 3.000 kr. ekskl. moms, betales én gang, klar på 7 dage, ingen binding, du ejer siden, hvad der er med i prisen, tilvalg og priser (SEO og annoncering fra 999 kr./md., interne systemer fra 14.999 kr., automations fra 4.999 kr.), teamet (Alexander, Malthe, Anna, Mikkel), processen i 3 trin, FAQ-svarene.
Opfind aldrig kunder, anmeldelser, resultater, tal eller cases. Referencesiden er demodata og må ikke citeres.

## Tekster

Instagram: krog i første linje, 3–6 korte linjer og CTA "↓ Gratis tilbud via linket i bio." Ingen hashtags i teksten.
Første kommentar (kolonne N): 5–9 hashtags (altid `#webleads`). Make sætter dem som første kommentar på Instagram, lige efter opslaget.
Facebook: samme tekst, men CTA med klikbart link `https://webleads.dk/?utm_source=facebook&utm_medium=social&utm_campaign=opslag` (+ `#kontakt`, `#pris`, `#tilvalg` eller `#teamet`) og 2–3 hashtags i selve teksten.
Reels: kortere tekst end opslaget samme dag, samme CTA som Instagram. Facebook-teksten bruger `utm_campaign=reel`.
Karruseller: skriv "Swipe og se det hele." på Instagram. På Facebook bliver billederne vist som et album, så skriv "Se dem alle på billederne." i stedet.

## Kalenderen

Kolonner: `ID | Dato | Tid | Type | Kanal | Medie-URL | Tekst Instagram | Tekst Facebook | Status | Postet | Post-ID | Note | Tidspunkt (auto) | Første kommentar`

- `Dato` som `2026-10-19`, `Tid` som `19:00`. `Tid` skal være en hel time fra `08:00` til `21:00` (kolonnen har en rulleliste med de tilladte tider).
- `Type`: `Opslag`, `Karrusel` eller `Reel`. `Kanal`: `Instagram + Facebook` (også for reels; de går ud som reel på begge). `Instagram` eller `Facebook` alene virker også.
- `Medie-URL`: ét link til et opslag (PNG/JPG) eller en reel (MP4). For en karrusel: 2–10 JPG-links, ét pr. linje i samme celle (Instagram tager kun JPG i karruseller).
- `Første kommentar` (N): hashtags, som Make poster som første kommentar på Instagram. Lad den være tom, hvis der ikke skal være en kommentar.
- `Status`: `Klar` (Make poster, når tidspunktet er nået) · `Sender` (Make er i gang, eller det fejlede midtvejs) · `Postet` · `Fejl` · `Pause` (springes over).
- Skriv aldrig i kolonne M. Den er en formel. Skriv A–L og N hver for sig.
- Find første tomme række ud fra kolonne A og skriv dér (ikke append, formlen i M fylder kolonnen).
- Regnearket er dansk: formler bruger semikolon og danske funktionsnavne.

## Begrænsninger

Instagrams API kan ikke lave stories, link-stickers eller musik fra Instagrams bibliotek. Reels skal være 9:16 og 3–90 sek. for at kunne gå ud på Facebook. Derfor bliver de animerede videoer lagt op som reels (kun under Reels-fanen, ikke i gitteret). Vil du have dem som story med link-sticker, skal det gøres i appen.
