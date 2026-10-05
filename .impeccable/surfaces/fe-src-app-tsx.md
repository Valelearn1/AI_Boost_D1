---
version: 1
slug: "fe-src-app-tsx"
primary_target: "FE/src/App.tsx"
related_targets: []
---

# Surface brief: app shell "Diario spese" (tutte le schermate)

- **Mode:** Operate. Utente unica; registra spese al volo (una mano, alla cassa, in pieno giorno) e a fine giornata (seduta, più spese di fila); vuole sapere subito quanto ha speso e quanto le resta nel mese.
- **Schermate:** Mese (home), Nuova/Modifica spesa, Categorie, Budget del mese.
- **Build path:** code-led (nessuna generazione immagini in questa sessione). Le schermate di riferimento arriveranno da Google Stitch, generate dal prompt in `docs/design/stitch-prompt.md`; diventano il riferimento di critica alla finish review.
- **Scena fisica:** di giorno, telefono in mano alla cassa o per strada, spesso in piena luce; la sera sul divano. Tema chiaro: massimo contrasto all'aperto. Tema scuro fuori ambito per l'MVP.

## Direction contract

THESIS: Il mese è un diario scolastico: una fascia per giorno con il numero grande, e le categorie segnate con l'evidenziatore. Rifiuta l'arrangiamento di default della categoria (card bianche arrotondate, ciambella delle categorie, icone emoji tonde, verde/rosso da banca).

OWN-WORLD: Testata blu "copertina di diario" (#1F3DB0) a tutta larghezza, pagina bianca (#FFFFFF), inchiostro quasi nero (#15171C), filetti a 1px (#DDE1EA). Le categorie sono colori evidenziatore piatti e pieni (giallo #FFE45C, arancio #FFB050, corallo #FF8F7A, rosa #FF8AC2, lilla #C7A6FF, azzurro #6CCBFF, turchese #5FE0D2, verde #7EE08A, lime #C6E85A; grigio #D4D8E0 per "Altro"), sempre con testo inchiostro sopra. Il blu copertina è anche il colore interattivo (penna). Tipo: Archivo a due larghezze, condensato e nero per i numerali (giorni, importi) e normale per l'interfaccia; cifre tabellari ovunque ci siano importi. Niente gradienti, ombre, carta a righe, adesivi o scarabocchi.

STORY: Apre e legge subito speso / budget / rimanente sulla copertina blu; tocca "+" col pollice, digita l'importo sul tastierino numerico, sceglie la categoria come un evidenziatore e salva; la nuova riga resta evidenziata nel giorno finché non la vede. A fine mese scorre i giorni come pagine.

FIRST VIEWPORT: (390×844) Testata blu dall'area sicura in alto: riga mese "‹ Ottobre 2026 ›" in bianco; sotto, "Speso" e l'importo in Archivo condensato nero 52px bianco; riga compatta di tre fatti (Budget 1.200,00 € · Rimangono 357,50 € · 26 giorni) in bianco al 80%; la barra del budget come passata di evidenziatore giallo su binario bianco al 20%, piena al 70%. Sotto, su bianco, la ripartizione: righe con l'etichetta della categoria evidenziata, importo tabellare a destra. Poi le fasce dei giorni: numerale 32px condensato nella colonna sinistra da 56px con "LUN" sotto, spese a destra (descrizione, etichetta evidenziata, importo), totale del giorno nell'intestazione della fascia. Barra in basso bianca con Mese · Categorie e pulsante "+" blu 56px al centro.

FORM: Signature move = la "passata di evidenziatore": un rettangolo piatto del colore di categoria dietro al testo, sul 70% inferiore della riga, che sporge di 0,25em a sinistra e destra, raggio 2px; anima da sinistra a destra (scaleX, 220ms, ease-out) solo quando nasce (nuova spesa, barra del budget, categoria selezionata). Raise: cifre tabellari in colonna fissa e riga nuova evidenziata finché non la vedi (boarding pass); blocco di riepilogo denso, non tre card (web giapponese ad alta densità); colore piatto senza gradienti né ombre (zoo map); filetti a 1px e pochissimi grigi (centre rail); focus su una categoria che attenua le altre e filtra l'elenco (streaming wall). Posizione 7 della mia lista; seed key d024f768.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Decisioni aperte
- Font definitivo da verificare in implementazione (Archivo: disponibilità della larghezza condensata e delle cifre tabellari).
- Le schermate di Stitch possono far emergere dati extra per l'API (vedi spec, passo 4).
