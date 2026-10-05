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
