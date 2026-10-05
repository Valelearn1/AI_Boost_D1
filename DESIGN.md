---
name: Diario spese
description: Il mese come un diario scolastico, con le categorie segnate a evidenziatore.
colors:
  cover: "#1f3db0"
  paper: "#ffffff"
  paper-cool: "#f4f6fb"
  ink: "#15171c"
  pencil: "#5a6070"
  hairline: "#dde1ea"
  error: "#c8102e"
  on-cover: "#ffffff"
  on-cover-muted: "rgb(255 255 255 / 0.82)"
  on-cover-rule: "rgb(255 255 255 / 0.3)"
  hl-green: "#7ee08a"
  hl-sky: "#6ccbff"
  hl-yellow: "#ffe45c"
  hl-orange: "#ffb050"
  hl-pink: "#ff8ac2"
  hl-teal: "#5fe0d2"
  hl-grey: "#d4d8e0"
  hl-coral: "#ff8f7a"
  hl-lilac: "#c7a6ff"
  hl-lime: "#c6e85a"
typography:
  display-input:
    fontFamily: "'Archivo Variable', 'Archivo', system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "64px"
    fontWeight: 800
    lineHeight: 1.1
    fontVariation: "\"wdth\" 72"
    fontFeature: "\"tnum\""
  display:
    fontFamily: "'Archivo Variable', 'Archivo', system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "56px"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.01em"
    fontVariation: "\"wdth\" 72"
    fontFeature: "\"tnum\""
  numeral-day:
    fontFamily: "'Archivo Variable', 'Archivo', system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "32px"
    fontWeight: 800
    lineHeight: 1
    fontVariation: "\"wdth\" 72"
  headline:
    fontFamily: "'Archivo Variable', 'Archivo', system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "20px"
    fontWeight: 800
    lineHeight: 1.1
    fontVariation: "\"wdth\" 72"
  title:
    fontFamily: "'Archivo Variable', 'Archivo', system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "20px"
    fontWeight: 700
    lineHeight: 1.2
  body:
    fontFamily: "'Archivo Variable', 'Archivo', system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.4
  body-small:
    fontFamily: "'Archivo Variable', 'Archivo', system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.4
  label:
    fontFamily: "'Archivo Variable', 'Archivo', system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "12px"
    fontWeight: 600
    letterSpacing: "0.04em"
rounded:
  sm: "2px"
  md: "6px"
  full: "50%"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "6": "24px"
  "8": "32px"
components:
  button-primary:
    backgroundColor: "{colors.cover}"
    textColor: "{colors.on-cover}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "52px"
    width: "100%"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.cover}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "44px"
  button-secondary-hover:
    backgroundColor: "{colors.paper-cool}"
  button-danger:
    backgroundColor: "{colors.error}"
    textColor: "{colors.on-cover}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "44px"
  button-text:
    textColor: "{colors.cover}"
    padding: "0 8px"
    height: "44px"
  icon-button:
    textColor: "{colors.pencil}"
    rounded: "{rounded.md}"
    size: "44px"
  input-field:
    backgroundColor: "{colors.paper-cool}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
    height: "44px"
  field-label:
    textColor: "{colors.pencil}"
    typography: "{typography.label}"
  chip:
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0 12px"
    height: "44px"
  chip-hover:
    backgroundColor: "{colors.paper-cool}"
  segmented-option:
    textColor: "{colors.ink}"
    height: "44px"
  segmented-option-selected:
    backgroundColor: "{colors.cover}"
    textColor: "{colors.on-cover}"
  cover-header:
    backgroundColor: "{colors.cover}"
    textColor: "{colors.on-cover}"
    padding: "8px 16px 24px"
  tabbar:
    backgroundColor: "{colors.paper}"
    height: "64px"
  tabbar-tab:
    textColor: "{colors.pencil}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "4px 8px"
  tabbar-tab-active:
    textColor: "{colors.cover}"
  tabbar-add:
    backgroundColor: "{colors.cover}"
    textColor: "{colors.on-cover}"
    rounded: "{rounded.full}"
    size: "56px"
  notice:
    backgroundColor: "{colors.paper-cool}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "16px"
  budget-bar:
    backgroundColor: "{colors.hl-yellow}"
    rounded: "{rounded.sm}"
    height: "10px"
---

# Design System: Diario spese

## Overview

**Creative North Star: "Il diario di scuola"**

Il mese si sfoglia come le pagine di un diario: una fascia per giorno con il numero grande, una copertina blu in alto, e le categorie segnate con l'evidenziatore. Il mondo presta all'interfaccia solo quattro cose: tipo, colore, densità e un unico gesto distintivo. Layout, navigazione e controlli restano quelli di una web app mobile, riconoscibili al primo tocco.

Il sistema è chiaro, piatto e denso. La copertina blu porta il riepilogo del mese in un solo blocco compatto; la pagina bianca porta i dati, separati da filetti a 1px. Il tono è asciutto: superare il budget è un'informazione, non una colpa. Il tema è solo chiaro, pensato per il telefono in piena luce alla cassa.

Rifiuti confermati: card bianche arrotondate con ombra, grafici a ciambella, icone emoji tonde per le categorie, verde/rosso da banca, e ogni costume da cartoleria (carta a righe, adesivi, scarabocchi, font scritti a mano).

**Key Characteristics:**
- Un solo gesto distintivo: la passata di evidenziatore, piatta, dietro al 70% inferiore del testo.
- Un solo carattere, Archivo variabile, in due larghezze: condensato (asse `wdth` al 72%) e nero per i numerali, normale per l'interfaccia.
- Blu copertina come shell e come colore interattivo (la penna).
- Piatto: nessuna ombra di elevazione, profondità solo da colore e filetti a 1px.
- Densità alta: riepilogo in un blocco, righe con importi tabellari allineati a destra.

**Movimento (D-018).** Motion (`motion/react`) è la base; i componenti React Bits e Animate UI stanno, adattati, in `FE/src/components/vendor/`. Curva unica `cubic-bezier(0.16, 1, 0.3, 1)`, durate 0,2–0,35 s; con "riduci movimento" niente spostamenti (`MotionConfig reducedMotion="user"`), griglia ferma, niente scintille.
- *Funzionale:* il mese si sfoglia (la pagina entra di 56px dal lato del mese scelto); il totale "Speso" scorre a cifre rotanti (Animate UI Sliding Number, assestamento in circa 1 s); l'anteprima del budget segue la cifra (React Bits CountUp); filtrando, le righe si chiudono in altezza; avvisi e conferme si aprono in altezza.
- *Decorativo:* sulla copertina una griglia di quadretti bianchi al 7% che scorre in diagonale (React Bits ShapeGrid, su desktop i quadretti al passaggio del puntatore si illuminano di giallo); i titoli di copertina si rivelano lettera per lettera da una leggera sfocatura (React Bits BlurText); le fasce dei giorni entrano a cascata (60 ms l'una, al massimo 8); toccando "+" e i pulsanti di salvataggio partono scintille negli evidenziatori giallo e arancio (React Bits ClickSpark, solo sugli elementi `data-spark`).
- La passata di evidenziatore resta il gesto distintivo: le decorazioni stanno sulla copertina e sui tocchi, mai sui dati.

## Colors

Strategia "committed": un blu pieno per la copertina e le azioni, una pagina bianca con pochissimi grigi, e dieci evidenziatori piatti che codificano le categorie.

### Primary
- **Blu copertina** (`cover`): la testata a tutta larghezza, il pulsante "+", i pulsanti primari, i link, l'anello di focus, la scelta attiva del controllo segmentato, la scheda attiva della barra in basso, il giorno di oggi e il cursore di inserimento.

### Secondary
- **Evidenziatori di categoria** (`hl-green`, `hl-sky`, `hl-yellow`, `hl-orange`, `hl-pink`, `hl-teal`, `hl-grey`, `hl-coral`, `hl-lilac`, `hl-lime`): Verde, Azzurro, Giallo, Arancio, Rosa, Turchese, Grigio, Corallo, Lilla, Lime, proposti in quest'ordine alle nuove categorie (il primo libero). Il Grigio è il colore di "Altro". Vivono solo come passate o campioni pieni, mai come colore del testo.
- **Giallo evidenziatore** (`hl-yellow`) ha due ruoli fissi oltre alle categorie: il riempimento della barra del budget e la selezione del testo (`::selection`, anche dentro la copertina).
- **Corallo** (`hl-coral`) segna il superamento: il tratto finale della barra del budget e la passata dietro all'importo sotto "Superato di" sulla copertina, in inchiostro.

### Neutral
- **Carta** (`paper`): fondo delle pagine e della barra in basso; anello di 4px che stacca il pulsante "+" dal contenuto.
- **Carta fredda** (`paper-cool`): fondo dei campi, degli avvisi, il binario della barra del budget sulla pagina, il passaggio del puntatore su pulsanti secondari, icone e chip.
- **Inchiostro** (`ink`): testo principale, importi, testo sopra ogni evidenziatore.
- **Matita** (`pencil`): etichette, giorno della settimana, totali del giorno, testi d'aiuto, segnaposto, schede inattive.
- **Filetto** (`hairline`): tutti i separatori a 1px, il bordo dei controlli segmentati e degli avvisi, la riga di base del campo importo (2px).
- **Bianco su copertina** (`on-cover`, `on-cover-muted` all'82%, `on-cover-rule` al 30%): testo della copertina, etichette dei fatti, filetti verticali tra i fatti.
- **Rosso conto** (`error`): messaggi e bordi d'errore, pulsante e azione di eliminazione. Non colora gli importi.

### Named Rules
**The Highlighter Rule.** Gli evidenziatori sono sempre campiture piatte e piene con testo inchiostro sopra. Mai testo colorato evidenziatore su bianco, mai gradienti, mai sfumature.

**The One Pen Rule.** Tutto ciò che si tocca e porta un colore usa il blu copertina; gli evidenziatori non sono mai colore di un'azione.

## Typography

**Display Font:** Archivo Variable (self-hosted da `@fontsource-variable/archivo`, file con asse `wdth`), con fallback Archivo, system-ui, -apple-system, Segoe UI, sans-serif.
**Body Font:** lo stesso Archivo, larghezza normale (`font-stretch: 100%`).

**Character:** un grotesk da lavoro in due larghezze. Il condensato nero (`font-stretch: 72%`, peso 800) dà ai numeri la presenza di un timbro; la larghezza normale tiene l'interfaccia leggibile e neutra.

### Hierarchy
- **Display input** (800, 64px condensato, 1.1; 48px nella variante compatta): l'importo che si digita nel form di spesa e di budget.
- **Display** (800, 56px condensato, 1, -0.01em): l'importo speso del mese sulla copertina.
- **Numerale giorno** (800, 32px condensato, 1): il numero del giorno nella colonna sinistra della fascia.
- **Headline / titolo di sezione** (800, 20px condensato, 1.1, inchiostro): titoli delle sezioni nella pagina ("Per categoria", "Spese", "Nuova categoria").
- **Title** (700, 20px larghezza normale, 1.2): il titolo nella copertina (mese, nome della schermata), centrato.
- **Body** (400, 16px, 1.4): descrizioni, campi, righe. Importi delle righe in 600. Testi lunghi entro 60ch.
- **Body small** (400, 14px): testi d'aiuto, totale del giorno, conteggi; errori dei campi in 600.
- **Label** (600, 12px, +0.04em, maiuscolo, matita): etichette dei campi e dei fatti della copertina. Le schede della barra in basso e il giorno della settimana usano lo stesso 12px/600 senza maiuscolo forzato.

### Named Rules
**The Tabular Rule.** Ogni importo usa cifre tabellari (`tabular-nums`), allineato a destra, e passa sempre dallo stesso formattatore: euro italiano con separatore delle migliaia sempre attivo (`useGrouping: 'always'`), quindi "1.200,00 €", mai "1200,00 €".

**The Two Widths Rule.** Il condensato è per i numerali e per i titoli di sezione; tutto il resto è a larghezza normale. Un titolo di sezione (20px condensato 800 inchiostro) non si confonde mai con un'etichetta di campo (12px maiuscolo matita).

## Layout

Mobile-first con riferimento 390px, una colonna sola. La colonna di contenuto è larga al massimo 560px più 16px di margine per lato, centrata, identica per copertina, pagina e barra in basso. Le sezioni della pagina sono distanziate di 32px; dentro un form i gruppi di 24px.

Ritmo di spaziatura su base 4px: 4, 8, 12, 16, 24, 32. Ogni area toccabile è alta almeno 44px; le righe di spesa 56px, le righe di categoria 60px, il pulsante primario 52px.

- **Copertina:** a tutta larghezza dall'area sicura in alto; barra a tre colonne (44px, titolo, 44px) con frecce o azioni; sotto, il riepilogo come un blocco unico: "Speso", l'importo display, tre fatti in riga separati da filetti verticali, la barra del budget.
- **Fascia del giorno:** griglia con colonna sinistra fissa da 56px (numerale e giorno della settimana) e righe di spesa a destra; filetto in alto, totale del giorno a destra in matita.
- **Ripartizione:** righe a tutta larghezza con etichetta evidenziata a sinistra e importo a destra; la quota sul totale è un filo da 3px alla base della riga.
- **Barra in basso:** fissa, 64px più l'area sicura, griglia Mese · + · Categorie con il cerchio "+" che sporge di metà sopra il filetto.
- **Azioni del form:** la barra di salvataggio è appiccicata in basso, su carta con filetto superiore, raggiungibile col pollice anche a tastiera aperta.

**The Density Rule.** Il riepilogo è un unico blocco compatto, mai tre card affiancate.

## Elevation & Depth

Piatto. Nessuna ombra di elevazione e nessun gradiente. La profondità nasce dal blocco blu della copertina contro la pagina bianca, dalla carta fredda dei campi e dai filetti a 1px. Le conferme stanno dentro la pagina, in un riquadro con filetto, mai in un modale. Il pulsante "+" si stacca dal contenuto che scorre sotto con un anello di carta da 4px, non con un'ombra.

### Shadow Vocabulary
- **Anello di focus del "+"** (`box-shadow: 0 0 0 6px var(--cover)` dentro l'anello carta da 4px): l'unica `box-shadow` con funzione di stato, solo su `:focus-visible`.
- **Filetto del binario** (`box-shadow: inset 0 0 0 1px var(--hairline)`): disegna il filetto della barra del budget su carta; è un bordo, non profondità.

### Named Rules
**The Flat Rule.** Le superfici sono piatte in ogni stato. Il passaggio del puntatore cambia colore di fondo o luminosità (`brightness(1.12)` sui pulsanti pieni), mai l'altezza.

**The Hairline Rule.** Ogni separatore è un filetto da 1px color filetto; niente bordi spessi, niente riquadri dentro riquadri.

## Shapes

Angoli quasi vivi. 2px per le passate di evidenziatore, i chip, i campioni di colore e la barra del budget; 6px per campi, pulsanti, avvisi, conferme, controlli segmentati e aree toccabili delle icone; l'unico cerchio è il pulsante "+" da 56px. Le icone sono SVG disegnate a tratto da 2px con estremità arrotondate, 24px (28px per il "+").

## Components

### Buttons
Pieni e decisi, nessun ornamento.
- **Shape:** angoli lievi (6px), altezza minima 44px, testo 600.
- **Primary:** blu copertina pieno, testo bianco, a tutta larghezza, 52px di altezza (44px dentro l'editor di categoria).
- **Secondary:** fondo carta, bordo 1px blu, testo blu; al passaggio del puntatore fondo carta fredda.
- **Danger:** rosso conto pieno, testo bianco; solo per confermare un'eliminazione.
- **Text:** solo testo blu 600 (varianti rosso per eliminare e matita per annullare), sottolineato al passaggio del puntatore.
- **Hover / Focus:** pulsanti pieni `brightness(1.12)`; focus con contorno 2px blu e scarto 2px (bianco dentro la copertina). Disabilitati al 40% di opacità.

### Chips
Le categorie del form, come un evidenziatore appoggiato e poi passato.
- **Style:** testo inchiostro su fondo trasparente, 44px di altezza, raggio 2px; sotto il nome un tratto sottile del colore di categoria alto il 22% della riga.
- **State:** scelto, il tratto diventa la passata piena al 70% e si traccia da sinistra a destra, il nome passa a 600; al passaggio del puntatore fondo carta fredda; focus con contorno 2px blu.

### Cards / Containers
Non esistono card. Gli unici riquadri sono avvisi e conferme.
- **Corner Style:** 6px.
- **Background:** carta fredda per gli avvisi, carta per le conferme.
- **Shadow Strategy:** nessuna (vedi Elevation & Depth).
- **Border:** filetto 1px.
- **Internal Padding:** 16px.

### Inputs / Fields
- **Style:** fondo carta fredda, bordo 1px trasparente, raggio 6px, padding 12px 16px, etichetta sopra in label maiuscolo matita.
- **Focus:** il bordo diventa blu copertina.
- **Error:** bordo rosso conto e messaggio 14px 600 rosso sotto il campo.
- **Campo importo:** senza riquadro, numerale display condensato su una riga di base da 2px color filetto (blu a fuoco, rossa se non valido), "€" a 32px 700 in matita.
- **Controllo segmentato:** opzioni a pari larghezza in un riquadro con filetto e raggio 6px, separate da filetti; la scelta è blu pieno con testo bianco.

### Navigation
- **Barra in basso:** fondo carta, filetto superiore, tre posizioni Mese · + · Categorie. Le schede hanno icona 24px e testo 12px 600 in matita; l'attiva è blu, al passaggio del puntatore inchiostro.
- **Pulsante "+":** cerchio blu da 56px con icona bianca 28px, alzato di 28px sopra la barra e separato dal contenuto da un anello carta di 4px.
- **Copertina:** frecce del mese e azioni in aree da 44px, fondo bianco al 12% al passaggio del puntatore.

### La passata di evidenziatore
Il gesto distintivo, e l'unico. Un rettangolo piatto del colore di categoria dietro al testo: copre il 70% inferiore della riga, sporge di 0,25em a sinistra e a destra, raggio 2px, va a capo con il testo.
- **Dove:** etichette di categoria nelle righe e nella ripartizione; chip scelto; barra del budget (riempimento giallo su binario bianco al 20% sulla copertina, o carta fredda con filetto sulla pagina; oltre il budget la barra resta piena e termina in corallo); spesa appena salvata.
- **Movimento:** si traccia da sinistra a destra (`scaleX` da 0 a 1, 220ms, `cubic-bezier(0.16, 1, 0.3, 1)`) solo quando nasce: selezione del chip, barra del budget al caricamento, spesa appena salvata. Con `prefers-reduced-motion` compare già piena.
- **Spesa appena salvata:** la riga scorre al centro della vista e solo dopo, quando è visibile, la descrizione riceve la passata del colore della sua categoria.
- **Ripartizione:** toccando una categoria le altre righe si attenuano al 35% (180ms) e l'elenco si filtra.

## Do's and Don'ts

### Do:
- **Do** usare la passata di evidenziatore come unico gesto distintivo, sempre nel colore della categoria e con testo inchiostro sopra.
- **Do** animare la passata solo quando nasce (220ms, da sinistra a destra) e mostrarla già piena con `prefers-reduced-motion`.
- **Do** dare a ogni testo animato (titoli, totale, anteprima) una copia leggibile per gli screen reader e nascondere le cifre animate (`aria-hidden`).
- **Do** spegnere griglia, scintille e spostamenti con "riduci movimento".
- **Do** formattare ogni importo con cifre tabellari e separatore delle migliaia sempre attivo ("1.200,00 €").
- **Do** usare il condensato 800 per numerali e titoli di sezione, la larghezza normale per tutto il resto.
- **Do** separare con filetti da 1px e tenere aree toccabili di almeno 44px.
- **Do** lasciare evidenziata la spesa appena salvata, rivelata dopo averla portata in vista.
- **Do** scrivere testi asciutti: "Superato di", "Nessuna spesa a ottobre 2026.", "Non impostato".

### Don't:
- **Don't** usare ombre di elevazione o gradienti; l'unica `box-shadow` di stato è l'anello di focus del pulsante "+".
- **Don't** colorare il testo con un evidenziatore né usare un evidenziatore per un'azione.
- **Don't** introdurre un tema scuro: il sistema è solo chiaro.
- **Don't** usare card bianche arrotondate con ombra, grafici a ciambella o icone emoji tonde per le categorie.
- **Don't** usare verde/rosso da banca per gli importi: qui esistono solo spese, e il superamento è corallo, non rosso.
- **Don't** vestire l'interfaccia da cartoleria: niente carta a righe, adesivi, scarabocchi, font scritti a mano. L'unico quadretto ammesso è la griglia animata della copertina, a tratto bianco al 7%.
- **Don't** animare i dati per decorazione: niente coriandoli, rimbalzi o effetti sugli importi oltre allo scorrimento delle cifre.
- **Don't** usare modali per le conferme: stanno nella pagina, in un riquadro con filetto.
