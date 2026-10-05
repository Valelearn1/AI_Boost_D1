---
name: Diario spese
description: Il mese come un diario scolastico, con le categorie segnate a evidenziatore.
---

<!-- SEED: established with the user before implementation; re-run /impeccable document once there's code to capture the actual tokens and components. -->

# Design System: Diario spese

## Overview

**Creative North Star: "Il diario di scuola".** Il mese si sfoglia come le pagine di un diario: una fascia per giorno, con il numero del giorno grande; le categorie sono segnate con l'evidenziatore. Il mondo presta all'interfaccia solo quattro cose: **tipo, colore, densità e un gesto distintivo**. Layout, navigazione e controlli restano quelli standard di una web app mobile.

- **Scena d'uso:** telefono in mano alla cassa o per strada, spesso in piena luce; la sera sul divano, per inserire più spese di fila. Per questo il tema è **chiaro**, con il massimo contrasto all'aperto. Il tema scuro è fuori ambito per l'MVP.
- **Tono:** asciutto e neutro. Superare il budget è un'informazione, non una colpa.
- **Gesto distintivo, "la passata di evidenziatore":** un rettangolo piatto del colore della categoria dietro al testo. Copre il 70% inferiore della riga, sporge di 0,25em a sinistra e a destra, ha raggio 2px. Si usa per: etichette di categoria, chip di categoria selezionato, barra del budget, spesa appena salvata.
- **Movimento:** la passata si traccia da sinistra a destra (`scaleX` da 0 a 1, 220ms, ease-out) **solo quando nasce** (nuova spesa, barra del budget al caricamento del mese, selezione di una categoria). Nessun'altra animazione decorativa; con `prefers-reduced-motion` la passata compare già piena.

## Colors

Strategia **Committed**: il blu copertina occupa tutta la testata (circa il 30% del primo schermo); la pagina bianca porta i dati; i colori evidenziatore codificano le categorie.

**The Highlighter Rule.** Gli evidenziatori sono sempre campiture piatte e piene, con testo inchiostro sopra. Mai testo colorato evidenziatore su bianco, mai gradienti, mai trasparenze sfumate.

| Ruolo | Nome | Valore | Uso |
|---|---|---|---|
| Primario / shell | Blu copertina | `#1F3DB0` | testata, pulsante "+", pulsanti primari, link, focus, giorno di oggi |
| Fondo | Carta | `#FFFFFF` | fondo delle pagine |
| Fondo secondario | Carta fredda | `#F4F6FB` | campi di input, fascia di intestazione del giorno |
| Testo | Inchiostro | `#15171C` | testo principale, importi |
| Testo secondario | Matita | `#5A6070` | etichette, giorno della settimana, totali secondari |
| Filetti | Filetto | `#DDE1EA` | separatori a 1px |
| Stato: superato | Rosso conto | `#C8102E` | importo rimanente negativo, messaggi di errore |

**Evidenziatori (palette delle categorie)**, testo sempre `#15171C`:

| Nome | Valore | Categoria iniziale |
|---|---|---|
| Verde | `#7EE08A` | Spesa |
| Azzurro | `#6CCBFF` | Casa |
| Giallo | `#FFE45C` | Trasporti |
| Arancio | `#FFB050` | Ristoranti |
| Rosa | `#FF8AC2` | Svago |
| Turchese | `#5FE0D2` | Salute |
| Grigio | `#D4D8E0` | Altro |
| Corallo | `#FF8F7A` | disponibile |
| Lilla | `#C7A6FF` | disponibile |
| Lime | `#C6E85A` | disponibile |

Sulla testata blu, la barra del budget è una passata **gialla** (`#FFE45C`) su un binario bianco al 20%. Quando il budget è superato la barra resta piena, e il testo "Superato di …" va in inchiostro su una passata **corallo** (`#FF8F7A`).

## Typography

**Carattere:** un solo grotesk da lavoro, in due larghezze. Ipotesi di direzione: **Archivo** (Google Fonts, asse di larghezza variabile). [Da verificare in implementazione: disponibilità della larghezza condensata e delle cifre tabellari; in alternativa, una grotesk condensata con `tnum`.]

| Ruolo | Uso | Indicazione |
|---|---|---|
| Numerale display | importo speso del mese, importo nel form | condensato, peso 800, 52–64px, interlinea 1 |
| Numerale giorno | numero del giorno nelle fasce | condensato, peso 800, 32px |
| Titolo | titoli di pagina, mese nella testata | larghezza normale, peso 700, 20px |
| Corpo | descrizioni, campi | larghezza normale, peso 400–500, 16px |
| Etichetta | giorno della settimana, etichette dei campi | peso 600, 12px, maiuscolo, spaziatura +0,04em |

**The Tabular Rule.** Ogni importo usa cifre tabellari (`font-variant-numeric: tabular-nums`), allineato a destra in una colonna fissa, nel formato `1.234,50 €`.

## Layout

- Mobile-first, riferimento **390px**; una colonna sola; margini laterali di 16px; contenuto limitato a 560px di larghezza su schermi grandi, centrato.
- **Testata (copertina):** a tutta larghezza dall'area sicura in alto: mese con frecce; blocco compatto speso / budget / rimanente / giorni restanti; barra del budget.
- **Fascia del giorno:** colonna sinistra fissa da 56px con il numerale e il giorno della settimana; a destra le righe delle spese; totale del giorno nell'intestazione della fascia.
- **Navigazione:** barra in basso con Mese · Categorie e il pulsante "+" al centro, raggiungibile col pollice; rispetta l'area sicura in basso.
- **The Density Rule.** Il riepilogo è un unico blocco compatto, non tre card affiancate. Ritmo di spaziatura su base 4px (4, 8, 12, 16, 24, 32).
- Aree toccabili ≥ 44px.

## Elevation & Depth

**Piatto.** Nessuna ombra e nessun gradiente. La profondità nasce solo dal blocco blu della testata contro la pagina bianca e dai filetti a 1px. Le schede che si sovrappongono (conferme, selettore della data) si distinguono per un filetto e per lo sfondo carta, non per un'ombra.

## Shapes

- Angoli quasi vivi: **2px** per le passate di evidenziatore e per i chip; **6px** per campi e pulsanti; il pulsante "+" è un **cerchio** da 56px.
- **The Hairline Rule.** Ogni separatore è un filetto da 1px `#DDE1EA`; niente bordi spessi, niente riquadri dentro altri riquadri.

## Do's and Don'ts

**Da fare**
- Usare la passata di evidenziatore come unico gesto distintivo, sempre con il colore della categoria.
- Lasciare evidenziata la spesa appena salvata (passata del colore della sua categoria dietro alla descrizione) finché non scorre fuori dalla vista.
- Toccando una categoria nella ripartizione: attenuare le altre e filtrare l'elenco.
- Scrivere testi asciutti: "Spesa salvata", "Budget superato di 42,30 €", "Nessuna spesa a ottobre".

**Da non fare**
- Niente costume da cartoleria: carta a righe o a quadretti, adesivi, scarabocchi, font scritti a mano, macchie d'inchiostro.
- Niente card bianche arrotondate con ombra, grafici a ciambella, icone emoji tonde per le categorie.
- Niente gamification, coriandoli o rimproveri al superamento del budget.
- Niente verde/rosso da banca per entrate e uscite: qui esistono solo spese.
