# Prompt per Google Stitch — Diario spese

Prompt da incollare in [Stitch](https://stitch.withgoogle.com) per generare le schermate mobile di **Diario spese**. Derivano da `DESIGN.md` (radice del progetto) e dal contratto di direzione in `.impeccable/surfaces/fe-src-app-tsx.md`.

## Come usarli

1. In Stitch crea un nuovo progetto in modalità **App (mobile)**.
2. *(Facoltativo)* Se Stitch te lo propone, importa `DESIGN.md` come design system del progetto: contiene già palette e regole.
3. Incolla il **Prompt 1** (contesto e design system + schermata Mese) e genera.
4. Per le schermate successive, **nello stesso progetto**, incolla i prompt da 2 a 5 uno alla volta, così Stitch mantiene lo stesso stile.
5. Se una schermata si allontana dallo stile, rigenerala o correggila con il **Prompt di correzione** in fondo.
6. Esporta ogni schermata (PNG e, se disponibile, HTML) in `docs/design/stitch/` con questi nomi:

| File | Schermata |
|---|---|
| `01-mese.png` | Mese (home) |
| `01b-mese-superato.png` | Mese con budget superato (variante) |
| `02-nuova-spesa.png` | Nuova spesa |
| `02b-modifica-spesa.png` | Modifica spesa con conferma di eliminazione |
| `03-categorie.png` | Categorie |
| `04-budget.png` | Budget del mese |
| `05-stati.png` | Stato vuoto ed errore di connessione |

> I prompt sono in **inglese** perché Stitch li interpreta in modo più affidabile; tutti i testi dell'interfaccia sono indicati **in italiano**, tra virgolette, e vanno riprodotti alla lettera. Gli importi e le spese sono dati dimostrativi.

---

## Prompt 1 — Contesto, design system e schermata "Mese"

```text
Design a mobile web app (390×844, iPhone viewport) called "Diario spese": a personal expense tracker for one person, used one-handed at the checkout right after paying, and in the evening to log several expenses in a row. ALL UI TEXT IS IN ITALIAN, reproduce the quoted strings exactly. Currency is euro, Italian number format: "1.234,50 €".

VISUAL WORLD — "the school diary" (Italian school planner + fluorescent highlighters). The world contributes ONLY type, colour, density and one signature move; layout, navigation and controls are standard mobile web components.
- Light theme only. Flat: NO shadows, NO gradients, NO glassmorphism, NO rounded white cards with drop shadows, NO donut/pie charts, NO emoji icons, NO lined/squared paper texture, NO stickers, NO handwritten fonts.
- Colours: cover blue #1F3DB0 (header band, primary buttons, "+" button, links, today marker); page white #FFFFFF; cool paper #F4F6FB (input fields, day header strip); ink #15171C (text, amounts); pencil grey #5A6070 (secondary text); hairline #DDE1EA (1px separators); over-budget red #C8102E (negative remaining, errors only).
- Category colours are flat fluorescent HIGHLIGHTER fills, always with ink #15171C text on top: Spesa #7EE08A (green), Casa #6CCBFF (light blue), Trasporti #FFE45C (yellow), Ristoranti #FFB050 (orange), Svago #FF8AC2 (pink), Salute #5FE0D2 (turquoise), Altro #D4D8E0 (grey). Spare: coral #FF8F7A, lilac #C7A6FF, lime #C6E85A.
- SIGNATURE MOVE — "the highlighter swipe": a flat rectangle of the category colour sitting BEHIND the text, covering the lower ~70% of the text line, extending ~0.25em past the text on both sides, 2px corner radius — exactly like a highlighter pen stroke on a word. Used for category labels, the selected category chip, the budget progress bar, and the just-saved expense row. Never as a pill/badge with full padding.
- Typography: one grotesk in two widths — "Archivo" (or a similar condensed grotesk if unavailable). Condensed ExtraBold (800) for big numerals: month total 52px, day numbers 32px. Normal width for UI: titles 20px/700, body 16px/400–500, labels 12px/600 UPPERCASE with +0.04em tracking. ALL amounts use tabular figures, right-aligned in a fixed column.
- Shapes: near-square corners — 2px for highlighter swipes and chips, 6px for inputs and buttons, the "+" button is a 56px circle. Separators are 1px hairlines; never boxes inside boxes.
- Spacing on a 4px grid (4, 8, 12, 16, 24, 32); 16px side margins; touch targets ≥ 44px.
- Tone of copy: dry and neutral, informative, never cheerful or judgemental.

SCREEN 1 — "Mese" (home), today is Monday 5 October 2026.

1. HEADER ("cover"): full-width band in cover blue #1F3DB0 starting under the status bar, white text.
   - Row: left chevron "‹", centered title "Ottobre 2026" (20px/700), right chevron "›".
   - Label "SPESO" (12px uppercase, white 80%), then the amount "952,40 €" in condensed ExtraBold 52px white.
   - One compact row of three facts, white 80%, separated by thin white 30% dividers: "Budget 1.200,00 €" with a small note under it "da settembre", "Rimangono 247,60 €", "27 giorni".
   - Budget bar: a full-width track in white at 20% opacity, 10px tall, filled 79% with a flat YELLOW highlighter swipe #FFE45C (2px radius). The bar is tappable (it opens the budget screen).
2. BREAKDOWN (white page, title "PER CATEGORIA" as a 12px uppercase label): a compact list, one row per category, each row = category name with its highlighter swipe behind it on the left, amount right-aligned in tabular figures, and a thin 4px bar underneath in the same category colour proportional to the share. Rows:
   "Casa" 722,40 € · "Trasporti" 99,00 € · "Spesa" 65,40 € · "Ristoranti" 41,20 € · "Salute" 14,90 € · "Svago" 9,50 €.
3. DAY LIST (title "SPESE" label). Each day is a band: a fixed 56px left column with the day number in condensed ExtraBold 32px and the weekday under it as a 12px uppercase label; on the right, the day's expenses as rows separated by 1px hairlines. Each expense row: description (16px) on the first line, the category name with its highlighter swipe on the second line (small, 13px), amount right-aligned in tabular figures. The day's total sits right-aligned on the band's header line in pencil grey. Today's day number is in cover blue.
   - "5" "LUN" (today, total "50,00 €"): "Caffè e brioche" Ristoranti 3,20 € — this row is JUST SAVED: its description text "Caffè e brioche" also has the orange Ristoranti highlighter swipe #FFB050 behind it (the just-saved marker); "Esselunga" Spesa 46,80 €.
   - "4" "DOM" (total "47,50 €"): "Pizzeria Da Gino" Ristoranti 38,00 €; "Cinema" Svago 9,50 €.
   - "3" "SAB" (total "74,90 €"): "Benzina" Trasporti 60,00 €; "Farmacia" Salute 14,90 €.
   - "2" "VEN" (total "91,00 €"): "Bolletta luce" Casa 72,40 €; "Mercato" Spesa 18,60 €.
   - "1" "GIO" (total "689,00 €"): "Affitto" Casa 650,00 €; "Abbonamento ATM" Trasporti 39,00 €.
4. BOTTOM NAVIGATION: white bar with a 1px top hairline, respecting the home-indicator safe area. Left tab "Mese" (active, cover blue, simple calendar line icon), right tab "Categorie" (pencil grey, simple tag line icon). In the centre a 56px cover-blue circle with a white "+" (accessible label "Aggiungi spesa"), slightly overlapping the bar's top edge.

The screen must read first as a clean, working expense app; the diary world shows only through the blue cover, the big condensed numerals, the day bands and the highlighter swipes.
```

### Variante — budget superato

```text
Same "Mese" screen and same design system, but for September 2026 where the budget is exceeded. Header: title "Settembre 2026", "SPESO" "1.242,30 €", facts row "Budget 1.200,00 €", "Superato di 42,30 €" (ink #15171C text on a flat CORAL #FF8F7A highlighter swipe), "0 giorni". The budget bar is fully filled with the yellow swipe, with a short coral segment at the right end marking the overflow. Do not use warning icons, red banners or judgemental copy. Keep the breakdown and the day list with plausible September data in the same format.
```

---

## Prompt 2 — "Nuova spesa"

```text
Using the same "Diario spese" design system (cover blue header, white page, highlighter swipes, Archivo condensed numerals, flat, no shadows), design the screen "Nuova spesa" (new expense), 390×844.

- HEADER: cover blue band, white text: left a back chevron "‹" with accessible label "Indietro", title "Nuova spesa" (20px/700).
- AMOUNT (the hero of the screen, right under the header on white): label "IMPORTO", then a huge amount field in condensed ExtraBold 64px ink: "12,50" followed by "€" in pencil grey; a 2px cover-blue underline shows the field is focused. Reserve the bottom half of the screen for the phone's numeric keypad but DO NOT draw the keyboard.
- CATEGORY: label "CATEGORIA", then wrapping chips, one per category: "Spesa", "Casa", "Trasporti", "Ristoranti", "Svago", "Salute", "Altro". Unselected chip = category name in ink with a small 10px square of its highlighter colour before it, 1px hairline border, 2px radius, 44px tall. Selected chip ("Ristoranti") = full flat orange highlighter fill #FFB050, ink text, no border.
- DATE: label "DATA", a segmented control with "Oggi" (selected, cover blue fill, white text), "Ieri", and "Altra data…" (opens a native date picker).
- DESCRIPTION: label "DESCRIZIONE (FACOLTATIVA)", a text input on cool paper #F4F6FB, 6px radius, value "Pranzo", helper text in pencil grey "Max 100 caratteri".
- PRIMARY ACTION: a full-width cover-blue button "Salva spesa" (white text, 6px radius, 52px tall) pinned above the keyboard area / safe area.
- No bottom navigation on this screen.
```

### Variante — modifica con conferma di eliminazione

```text
Same design system. Screen "Modifica spesa" (edit expense) for the existing expense "Pizzeria Da Gino", 38,00 €, category Ristoranti (selected chip), date shown as "Domenica 4 ottobre" in the date control, description "Pizzeria Da Gino". Header title "Modifica spesa". Under the "Salva modifiche" primary button, a text button "Elimina spesa" in red #C8102E. Show the inline confirmation state (no modal dialog): the delete button has expanded into a hairline-bordered strip on white with the text "Eliminare questa spesa? L'operazione non si può annullare." and two buttons side by side: "Annulla" (secondary, ink text, hairline border) and "Elimina" (red #C8102E fill, white text).
```

---

## Prompt 3 — "Categorie"

```text
Same "Diario spese" design system. Screen "Categorie" (manage categories), 390×844, with the same bottom navigation as the home screen but with the "Categorie" tab active.

- HEADER: cover blue band, title "Categorie" (20px/700, white).
- LIST on white, rows separated by 1px hairlines, 56px tall: category name with its highlighter swipe behind it, under it in pencil grey the number of expenses, and on the right an "edit" pencil line icon button (accessible label "Modifica"). Rows:
  "Casa" "14 spese" · "Spesa" "22 spese" · "Trasporti" "9 spese" · "Ristoranti" "11 spese" · "Svago" "4 spese" · "Salute" "3 spese" · "Altro" "0 spese".
- ERROR STATE on the "Casa" row: the row is expanded and shows an inline message on a cool paper #F4F6FB strip with a 3px red #C8102E left rule: "Non puoi eliminare «Casa»: ha 14 spese. Modifica o elimina prima quelle spese." and a text button "Ho capito".
- NEW CATEGORY form at the bottom of the list, under a label "NUOVA CATEGORIA": a text input (placeholder "Nome della categoria", value "Regali"), then a row of 10 colour swatches as 36px squares with 2px radius in the highlighter colours (#7EE08A, #6CCBFF, #FFE45C, #FFB050, #FF8AC2, #5FE0D2, #D4D8E0, #FF8F7A, #C7A6FF, #C6E85A); the selected one (lilac #C7A6FF) has a 2px ink outline with 2px offset. A live preview "Regali" with the lilac highlighter swipe behind it. Button "Aggiungi categoria" in cover blue, full width.
```

---

## Prompt 4 — "Budget del mese"

```text
Same "Diario spese" design system. Screen "Budget" for October 2026, 390×844, opened by tapping the budget bar on the home screen.

- HEADER: cover blue band, back chevron "‹" ("Indietro"), title "Budget di ottobre 2026".
- INFO STRIP on cool paper #F4F6FB with a 3px cover-blue left rule: "Ottobre non ha un budget proprio. Al momento vale quello di settembre 2026: 1.200,00 €."
- AMOUNT: label "BUDGET DI OTTOBRE", a large amount field in condensed ExtraBold 48px ink with "€" in pencil grey, value "1.300,00", 2px cover-blue underline (focused).
- A small preview below in pencil grey: "Con questo budget ti rimarrebbero 347,60 €" and a preview budget bar (cool paper track, yellow highlighter swipe filled 73%).
- Primary button "Salva budget" (cover blue, full width, 52px). Under it a text button "Rimuovi il budget di ottobre" in pencil grey, shown DISABLED (40% opacity) because October has no budget of its own yet.
- No bottom navigation.
```

---

## Prompt 5 — Stato vuoto ed errore di connessione

```text
Same "Diario spese" design system. Produce TWO 390×844 screens side by side.

A) EMPTY MONTH — the home screen "Mese" for "Novembre 2026" with no expenses yet. Header unchanged in structure: "SPESO" "0,00 €", facts "Budget 1.200,00 €" (note "da settembre"), "Rimangono 1.200,00 €", "30 giorni", empty budget bar track. Below, instead of the breakdown and day list, a quiet empty state aligned to the left (not centered, no illustration): the text "Nessuna spesa a novembre 2026." in ink 16px, then a secondary line in pencil grey "Le spese che aggiungi compaiono qui, giorno per giorno.", then an outlined cover-blue button "Aggiungi spesa". Bottom navigation with "+" as usual.

B) CONNECTION ERROR — the home screen while the server cannot be reached. Header shows the month "Ottobre 2026" with the amount area replaced by "—" placeholders. Below on white, a strip with a 3px red #C8102E left rule on cool paper: title "Impossibile raggiungere il server" (16px/600 ink), text "Controlla che il Mac sia acceso e connesso alla stessa rete Wi-Fi del telefono." (pencil grey), and a cover-blue button "Riprova". No illustrations, no emoji.
```

---

## Prompt di correzione (se una schermata esce dallo stile)

```text
Bring this screen back to the "Diario spese" design system: remove all shadows, gradients and rounded white cards; use the cover blue #1F3DB0 header band with white text; white page; 1px #DDE1EA hairline separators; category labels as flat highlighter swipes (colour rectangle behind the lower 70% of the text, 2px radius, ink text) instead of pills or badges; big numbers in a condensed ExtraBold grotesk with tabular figures; 2px/6px corners; Italian text exactly as specified; no emoji, no illustrations, no handwritten fonts, no lined paper.
```

---

## Prompt brevi (progetto Stitch con design system già caricato)

Nel tuo account Stitch esiste già il progetto **"Diario spese"**, con il design system caricato da `DESIGN.md`. Lì bastano prompt corti: lo stile (colori, Archivo Narrow, raggi, spaziature) lo prende dal design system. Prompt corti si generano più in fretta e vanno meno spesso in timeout. Se Stitch risponde "è già pronta" senza creare nulla, inizia il prompt con "Generate a NEW mobile app screen".

> Nota: interpretando il design system, Stitch ha aggiunto un'ombra al pulsante "+" e parla di "pagine a righe". Per questo ogni prompt ripete "no shadows, no lined paper".

**1 — Mese**
```text
Generate a NEW mobile app screen "Mese", home of the expense app "Diario spese". Italian text exactly as quoted. Flat: no shadows (not even on the + button), no gradients, no lined paper, no emoji.
1. Blue header (#1F3DB0, white text): "‹  Ottobre 2026  ›"; label "SPESO"; big condensed number "952,40 €"; compact row: "Budget 1.200,00 €" (small note "da settembre") | "Rimangono 247,60 €" | "27 giorni"; 10px budget bar: white 20% track filled 79% with flat yellow #FFE45C.
2. White section "PER CATEGORIA": category name on a flat highlighter swipe (colour rectangle behind the text, 2px radius), amount right-aligned: Casa #6CCBFF 722,40 € · Trasporti #FFE45C 99,00 € · Spesa #7EE08A 65,40 € · Ristoranti #FFB050 41,20 € · Salute #5FE0D2 14,90 € · Svago #FF8AC2 9,50 €.
3. Section "SPESE", one band per day: left 56px column with big condensed day number and weekday; right: rows (description, category highlighter label, amount right-aligned), 1px hairlines; day total in grey on the band's top line.
 - 5 LUN (blue number, today) 50,00 €: "Caffè e brioche" Ristoranti 3,20 € (description highlighted orange: just saved); "Esselunga" Spesa 46,80 €
 - 4 DOM 47,50 €: "Pizzeria Da Gino" Ristoranti 38,00 €; "Cinema" Svago 9,50 €
 - 3 SAB 74,90 €: "Benzina" Trasporti 60,00 €; "Farmacia" Salute 14,90 €
4. Bottom bar: tabs "Mese" (active, blue) and "Categorie", centre 56px blue circle with white "+".
```

**1b — Mese, budget superato**
```text
Generate a NEW screen: same "Mese" layout for "Settembre 2026", budget exceeded. Header: "SPESO" "1.242,30 €"; row "Budget 1.200,00 €" | "Superato di 42,30 €" (ink text on a flat coral #FF8F7A swipe) | "0 giorni"; bar fully yellow with a short coral end segment. No warning icons, no red banners. Plausible September expenses below. No shadows.
```

**2 — Nuova spesa**
```text
Generate a NEW screen "Nuova spesa". Blue header with "‹" and title "Nuova spesa". Label "IMPORTO", huge condensed amount "12,50" with grey "€", 2px blue underline. Label "CATEGORIA": wrapping chips "Spesa" "Casa" "Trasporti" "Ristoranti" "Svago" "Salute" "Altro" — unselected: small colour square + name, 1px hairline border, 2px radius, 44px tall; selected "Ristoranti": full flat orange #FFB050 fill. Label "DATA": segmented control "Oggi" (selected, blue) "Ieri" "Altra data…". Label "DESCRIZIONE (FACOLTATIVA)": input on #F4F6FB, value "Pranzo", helper "Max 100 caratteri". Full-width blue button "Salva spesa". Leave the lower area free for the keyboard (do not draw it). No bottom bar, no shadows.
```

**2b — Modifica spesa**
```text
Generate a NEW screen "Modifica spesa": same layout as "Nuova spesa" with amount "38,00", chip "Ristoranti" selected, date "Domenica 4 ottobre", description "Pizzeria Da Gino", button "Salva modifiche". Below, an inline confirmation strip (no modal) with 1px hairline border: "Eliminare questa spesa? L'operazione non si può annullare." and buttons "Annulla" (outlined) and "Elimina" (red #C8102E fill, white text). No shadows.
```

**3 — Categorie**
```text
Generate a NEW screen "Categorie". Blue header title "Categorie". List rows (56px, 1px hairlines): category name on its highlighter swipe, grey count below, pencil edit icon right: "Casa" "14 spese" · "Spesa" "22 spese" · "Trasporti" "9 spese" · "Ristoranti" "11 spese" · "Svago" "4 spese" · "Salute" "3 spese" · "Altro" "0 spese". Under "Casa", an inline error on #F4F6FB with a 3px red left rule: "Non puoi eliminare «Casa»: ha 14 spese. Modifica o elimina prima quelle spese." and text button "Ho capito". Bottom: label "NUOVA CATEGORIA", input "Regali", 10 colour squares (36px, 2px radius) in the highlighter colours with lilac #C7A6FF selected (2px ink outline), preview "Regali" on a lilac swipe, blue button "Aggiungi categoria". Bottom bar with "Categorie" active. No shadows.
```

**4 — Budget**
```text
Generate a NEW screen "Budget di ottobre 2026". Blue header with "‹". Info strip on #F4F6FB with a 3px blue left rule: "Ottobre non ha un budget proprio. Al momento vale quello di settembre 2026: 1.200,00 €." Label "BUDGET DI OTTOBRE", large condensed amount "1.300,00" with grey "€", blue underline. Grey text "Con questo budget ti rimarrebbero 347,60 €" and a preview bar 73% yellow. Blue button "Salva budget"; disabled grey text button "Rimuovi il budget di ottobre". No bottom bar, no shadows.
```

**5a — Mese vuoto**
```text
Generate a NEW screen: "Mese" for "Novembre 2026" with no expenses. Header: "SPESO" "0,00 €", "Budget 1.200,00 €" (note "da settembre") | "Rimangono 1.200,00 €" | "30 giorni", empty bar. Below, left-aligned, no illustration: "Nessuna spesa a novembre 2026." then grey "Le spese che aggiungi compaiono qui, giorno per giorno." and an outlined blue button "Aggiungi spesa". Bottom bar with "+". No shadows.
```

**5b — Errore di connessione**
```text
Generate a NEW screen: "Mese" for "Ottobre 2026" when the server cannot be reached. Header with "—" instead of amounts. Below, a strip on #F4F6FB with a 3px red #C8102E left rule: "Impossibile raggiungere il server" (bold), grey "Controlla che il Mac sia acceso e connesso alla stessa rete Wi-Fi del telefono.", blue button "Riprova". No illustrations, no shadows.
```
