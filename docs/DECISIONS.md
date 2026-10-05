# Registro delle decisioni

Registro cronologico delle decisioni di progetto. Ogni voce indica **cosa** si è deciso, **perché** e **quali alternative** sono state scartate. Le voci non si cancellano: se una decisione cambia, se ne aggiunge una nuova che la sostituisce.

Spec di riferimento: [`superpowers/specs/2026-10-05-gestione-spese-design.md`](superpowers/specs/2026-10-05-gestione-spese-design.md)

---

### D-001 · 2026-10-05 · App personale su Wi-Fi di casa, senza login
- **Decisione:** l'app è usata da una sola persona, sulla rete di casa; il telefono apre `http://<ip-mac>:5173`. Nessuna autenticazione.
- **Perché:** l'esigenza è inserire e consultare spese dallo smartphone; non serve raggiungerla da fuori casa, e senza deploy non serve proteggerla con login.
- **Alternative scartate:** deploy online (richiede autenticazione e persistenza in cloud); demo solo da desktop (non risponde all'esigenza mobile).

### D-002 · 2026-10-05 · H2 salvato su file
- **Decisione:** database H2 in modalità file (`./data/spese`), cartella `data/` esclusa da git.
- **Perché:** H2 è lo stack scelto; il file mantiene i dati tra un riavvio e l'altro, necessario per un uso reale.
- **Alternative scartate:** H2 in memoria (dati persi a ogni riavvio); PostgreSQL già presente nello scaffold (troppo per un progetto personale locale).

### D-003 · 2026-10-05 · Proxy di Vite invece di CORS
- **Decisione:** Vite ascolta sulla LAN (`server.host: true`) e inoltra `/api` a `localhost:8080`. Il FE usa solo percorsi relativi.
- **Perché:** niente configurazione CORS, nessun IP scritto nel codice, hot reload anche sul telefono.
- **Alternative scartate:** FE servito da Spring Boot (serve una build a ogni modifica); chiamate dirette al BE con CORS (fragile se l'IP del Mac cambia).

### D-004 · 2026-10-05 · Rimozione di PostgreSQL e WebSocket dallo scaffold
- **Decisione:** togliere dal `pom.xml` il driver `postgresql` e gli starter WebSocket; aggiungere H2 e Bean Validation.
- **Perché:** l'app è un CRUD REST su H2; il tempo reale non serve.
- **Alternative scartate:** lasciarli (dipendenze inutili e configurazione del datasource ambigua).

### D-005 · 2026-10-05 · Ambito dell'MVP
- **Decisione:** CRUD delle spese, categorie, riepilogo mensile con ripartizione per categoria, budget mensile.
- **Perché:** sono le quattro funzionalità richieste; il resto (ricorrenti, export, grafici storici, PWA) è rimandato.

### D-006 · 2026-10-05 · Categorie gestibili, eliminazione bloccata se in uso
- **Decisione:** le categorie si creano, rinominano ed eliminano dall'app; l'eliminazione di una categoria con spese restituisce `409` e un messaggio chiaro. Al primo avvio vengono create 7 categorie di partenza.
- **Perché:** flessibilità senza rischio di perdere dati e senza logica di riassegnazione.
- **Alternative scartate:** elenco fisso (poco flessibile); spostamento automatico in "Altro" o scelta della destinazione (più logica e più UI).

### D-007 · 2026-10-05 · Budget diverso per ogni mese, con ereditarietà
- **Decisione:** si può impostare un budget per ogni mese; se un mese non ne ha uno, vale quello del mese più recente precedente; se non ce n'è nessuno, non c'è budget.
- **Perché:** permette mesi "speciali" (es. dicembre) senza dover reinserire il budget ogni mese.
- **Alternative scartate:** budget unico per tutti i mesi (troppo rigido); budget per categoria (più schermate e più logica).

### D-008 · 2026-10-05 · Prima la grafica, poi l'API definitiva
- **Decisione:** ordine dei lavori: spec in bozza → Impeccable (`DESIGN.md`) → prompt Stitch → verifica dell'API sulle schermate → backend → frontend.
- **Perché:** le schermate possono far emergere dati da esporre (icone, statistiche extra) prima di scrivere gli endpoint, evitando di rifarli.
- **Alternative scartate:** backend in parallelo al design (rischio di rilavorare l'API).

### D-009 · 2026-10-05 · Flusso grafico Impeccable → Stitch → React
- **Decisione:** Impeccable definisce direzione visiva e design system; da lì si genera un prompt per Stitch; l'utente genera le schermate e le salva in `docs/design/stitch/`; il FE React le implementa usando i token di `DESIGN.md`.
- **Perché:** un design system coerente prima delle schermate, e schermate concrete prima del codice.
- **Alternative scartate:** Stitch solo come esplorazione separata; generazione automatica delle schermate tramite connettore Stitch.

### D-010 · 2026-10-05 · Documentazione in un unico registro
- **Decisione:** le decisioni stanno in questo file; spec, design system e prompt Stitch in `docs/`.
- **Alternative scartate:** ADR numerati, un file per decisione (più struttura del necessario per un progetto piccolo).

### D-011 · 2026-10-05 · Nome dell'app: "Diario spese"
- **Decisione:** l'app si chiama **Diario spese**.
- **Perché:** descrittivo e diretto, e richiama il mondo visivo scelto (D-012).
- **Alternative scartate:** Spicci, Segno, Conti.

### D-012 · 2026-10-05 · Mondo visivo "Diario scolastico"
- **Decisione:** il mese si presenta come un diario scolastico: testata blu copertina (`#1F3DB0`), pagina bianca, una fascia per giorno con il numero grande, categorie segnate con colori evidenziatore piatti. Gesto distintivo: la "passata di evidenziatore" dietro alle etichette, alla barra del budget e alla spesa appena salvata. Tema chiaro, nessuna ombra né gradiente, cifre tabellari. Dettagli in `DESIGN.md` e nel contratto di direzione `.impeccable/surfaces/fe-src-app-tsx.md`.
- **Perché:** proposto dal sorteggio di Impeccable e scelto dall'utente; è riconoscibile per chi è cresciuto con il diario e serve al compito: la struttura per giorni rispecchia l'elenco delle spese, gli evidenziatori codificano le categorie. Il tema chiaro garantisce la leggibilità in pieno giorno, alla cassa.
- **Alternative scartate:** Linee della metro di Milano (metafora infografica molto vista, affollata con molte categorie); Tabellone Solari (fondo scuro poco leggibile all'aperto); lo standard della categoria (card bianche, ciambella, emoji: indistinguibile).
- **Build path:** code-led. In questa sessione non è disponibile la generazione di immagini; le schermate di riferimento arriveranno da Stitch.

### D-013 · 2026-10-05 · PRODUCT.md e DESIGN.md nella radice del progetto
- **Decisione:** `PRODUCT.md` (fatti di prodotto) e `DESIGN.md` (design system) stanno nella radice, non in `docs/`. Il registro delle decisioni, la spec e il prompt di Stitch restano in `docs/`.
- **Perché:** gli script di Impeccable li cercano solo nella radice; spostandoli, la revisione finale e la rigenerazione dei token non li troverebbero.
- **Nota:** `DESIGN.md` è un *seed*, cioè la versione scritta prima del codice: dopo l'implementazione va rigenerato con `/impeccable document` a partire dai token reali.

### D-014 · 2026-10-05 · Schermate Stitch non bloccanti per backend e piano
- **Decisione:** Stitch non risponde (timeout sia dall'interfaccia sia dal connettore). L'API viene verificata sui contenuti delle schermate definiti nei prompt, e si procede con piano e backend. Le immagini di Stitch vanno generate ed esportate prima di implementare il frontend.
- **Perché:** il backend dipende dai dati mostrati, non dall'aspetto delle schermate; quei dati sono già fissati nei prompt.
- **Stato su Stitch:** progetto "Diario spese" creato con il design system caricato da `DESIGN.md`; in `docs/design/stitch-prompt.md` ci sono i prompt brevi da usare lì.

### D-015 · 2026-10-05 · Conteggio delle spese nella risposta delle categorie
- **Decisione:** `GET/POST/PUT /categories` restituiscono anche `expenseCount` (spese totali della categoria, su tutti i mesi).
- **Perché:** la schermata Categorie mostra "14 spese" e il conteggio permette di prevedere il blocco dell'eliminazione (D-006) senza tentare la `DELETE`.
- **Alternative scartate:** un endpoint separato per i conteggi (una chiamata in più per una sola schermata); nessun conteggio (l'utente scoprirebbe il blocco solo dopo aver tentato di eliminare).

### D-016 · 2026-10-05 · Frontend costruito direttamente in codice (Stitch abbandonato)
- **Decisione:** il frontend si implementa direttamente in React partendo da `DESIGN.md`, dal contratto di direzione (`.impeccable/surfaces/fe-src-app-tsx.md`) e dai contenuti delle schermate nei prompt (`docs/design/stitch-prompt.md`, usati come specifica funzionale). La verifica visiva si fa a fine build: screenshot mobile e desktop, detector e revisione finale di Impeccable, poi rigenerazione di `DESIGN.md`. Sostituisce il passaggio Stitch di D-009 e D-014.
- **Perché:** Stitch ha fallito tutte le generazioni (timeout dall'interfaccia e dal connettore). Il percorso code-led è quello già registrato da Impeccable per questo progetto.
- **Alternative scartate:** prototipo HTML navigabile da approvare sul telefono prima del React (un passaggio in più); aspettare Stitch (frontend bloccato a tempo indeterminato).
- **Conseguenza:** la grafica si vede solo a frontend costruito; le correzioni visive passano dalla revisione finale di Impeccable.

### D-017 · 2026-10-05 · Scelte di implementazione del frontend
- **Decisione:** React 19 + Vite 8 + `react-router` 8 (modalità dichiarativa), CSS puro con i token di `DESIGN.md`, font Archivo variabile in self-hosting (`@fontsource-variable/archivo`, asse di larghezza per i numeri condensati). Test con Vitest + Testing Library: API simulata e routing reale, "oggi" fissato al 5 ottobre 2026.
- **Dettagli emersi in implementazione:**
  - `Intl.NumberFormat('it-IT')` non mette il separatore delle migliaia nei numeri di 4 cifre; si usa `useGrouping: 'always'` per avere "1.200,00 €".
  - Gli importi si possono scrivere all'italiana ("12,50", "1.234,56", "1.200") o con il punto ("12.50"); al massimo 2 decimali.
  - Il backend spento (il proxy di Vite risponde 50x senza corpo) produce sempre il messaggio "Impossibile raggiungere il server", con "Riprova".
  - "Salva" non invia due volte con un doppio tocco.
  - La spesa appena salvata viene portata in vista ed evidenziata una sola volta: lo stato si toglie dalla cronologia, quindi tornando indietro non si ripete.
  - Il mese si legge da `/?mese=AAAA-MM`; un valore non valido porta al mese corrente.
- **Revisione di design (Impeccable):** due tornate. Corretti: la categoria scelta come passata di evidenziatore e non come riquadro pieno, la ripartizione più compatta (il primo giorno è visibile già nel primo schermo), il budget riconoscibile come modificabile (icona matita), i titoli di sezione distinti dalle etichette dei campi, il contrasto dei placeholder, "Rimuovi il budget" mostrato solo quando c'è un budget proprio, l'animazione della barra a 220ms.
- **Verifica visiva:** screenshot con viewport reale 390×844 e 1440×900 in `.impeccable/review/`, che sostituiscono le schermate di Stitch come riferimento visivo.

### D-018 · 2026-10-05 · Animazioni con Motion, React Bits e Animate UI (anche decorative)
- **Decisione:** Motion (`motion` 14) è la base delle animazioni. Da React Bits (varianti TS-CSS) e Animate UI (primitive) si copiano singoli componenti in `FE/src/components/vendor/`, adattati e senza Tailwind né `shadcn init`. Sostituisce la regola "nessuna animazione decorativa" del design system.
  - *Funzionali:* mese che si sfoglia nella direzione scelta, totale a cifre rotanti (Animate UI Sliding Number), anteprima del budget che segue la cifra (React Bits CountUp), righe che si chiudono filtrando, avvisi e conferme che si aprono in altezza.
  - *Decorative (scelte dall'utente):* griglia viva sulla copertina (ShapeGrid), titoli che si rivelano (BlurText), giorni a cascata, scintille su "+" e "Salva" (ClickSpark).
- **Perché:** richiesta dell'utente. Le librerie scelte funzionano senza Tailwind (stili inline o CSS puro), quindi il CSS del progetto (D-017) resta com'è.
- **Adattamenti al codice copiato:**
  - Sliding Number: molla più rapida con soglia di arrivo, perché l'originale impiegava oltre 3 s ad assestarsi.
  - ShapeGrid: senza vignettatura scura, ferma con "riduci movimento".
  - ClickSpark: scintille solo sugli elementi `data-spark`, su un livello fisso grande quanto lo schermo.
  - BlurText: dentro un titolo e nascosto agli screen reader.
  - CountUp: formato euro italiano.
- **Accessibilità:** `MotionConfig reducedMotion="user"`. Ogni testo animato ha una copia leggibile per gli screen reader. Nei test le animazioni sono istantanee (`MotionGlobalConfig.skipAnimations`) e le API del browser mancanti in jsdom sono simulate.
- **Costo:** bundle JS da 257 a 408 kB (131 kB compressi).

### D-019 · 2026-10-05 · Rifiniture del backend dopo la revisione
- **Decisione:** risolti i 5 punti minori rimandati dalla revisione del backend:
  - un importo oltre 99.999.999,99 riceve "L'importo è troppo grande";
  - un id decimale viene rifiutato (`accept-float-as-int=false`), non più troncato;
  - un mese con anno a più di 4 cifre dà 400 invece di 500;
  - nomi e descrizioni vengono ripuliti dagli spazi esterni prima del controllo di lunghezza;
  - gli importi nelle risposte hanno sempre 2 decimali.
- **Nota:** l'impostazione Jackson va ripetuta in `src/test/resources/application.properties`, che nei test sostituisce il file principale.
