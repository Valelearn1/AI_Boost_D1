# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Una sola persona, la proprietaria del progetto, che tiene traccia delle proprie spese personali. Usa l'app dallo smartphone in due situazioni:

- **subito dopo aver pagato**: in piedi, alla cassa o per strada, spesso con una mano sola e poca attenzione disponibile;
- **a fine giornata**: seduta, con calma, ricostruendo e inserendo più spese di fila.

In entrambi i casi vuole anche sapere a colpo d'occhio quanto ha speso nel mese rispetto al budget.

## Product Purpose

Registrare le spese personali in pochi secondi e consultare l'andamento del mese: totale speso, budget, rimanente e ripartizione per categoria. Successo = inserire una spesa senza attrito e capire subito "come sto andando questo mese".

## Positioning

Uno strumento personale costruito su misura, che gira sul Mac di casa: niente account, niente pubblicità, niente collegamento ai conti bancari, nessun dato che esce dalla rete di casa. Fa poche cose e le fa in fretta.

## Operating Context

- Backend Spring Boot + H2 su file sul Mac; frontend React servito da Vite; il telefono apre l'app dal browser sulla Wi-Fi di casa.
- Fuori casa l'app non è raggiungibile: le spese fatte fuori si inseriscono spesso a fine giornata.
- Progetto sviluppato durante un corso (AI Boost); le decisioni sono registrate in `docs/DECISIONS.md`, la spec in `docs/superpowers/specs/`.
- La grafica passa da Impeccable (direzione e design system) a un prompt per Google Stitch (schermate) e poi all'implementazione React.

## Capabilities and Constraints

- Spese: importo in €, data, descrizione facoltativa, categoria obbligatoria; creazione, modifica, eliminazione.
- Categorie gestibili dall'utente (nome + colore); l'eliminazione è bloccata se la categoria ha spese.
- Budget mensile diverso per ogni mese; un mese senza budget eredita l'ultimo budget precedente.
- Riepilogo mensile: totale, budget, rimanente (può essere negativo), totali per categoria, navigazione tra i mesi.
- Schermate: Mese (home), Nuova/Modifica spesa, Categorie, Budget.
- Mobile-first, riferimento 390px; interfaccia in italiano; formati numerici e date it-IT; valuta solo EUR.
- Fuori ambito: login, multi-utente, deploy online, spese ricorrenti, import/export, offline/PWA, grafici su più mesi.
- Nome dell'app: **Diario spese**.

## Brand Commitments

- Tono dei testi **asciutto e neutro**: informativo, senza commenti, battute o giudizi ("Spesa salvata", "Budget superato di 42 €").

## Evidence on Hand

Nessun dato reale, logo o asset. Le categorie iniziali sono: Spesa, Casa, Trasporti, Ristoranti, Svago, Salute, Altro. Ogni importo o spesa mostrato nei mockup è dimostrativo.

## Product Principles

1. **Inserire prima di tutto.** L'aggiunta di una spesa è l'azione più frequente: deve essere raggiungibile da ovunque e completabile in pochi tocchi, anche con una mano.
2. **Il mese in un colpo d'occhio.** La home risponde subito a "quanto ho speso e quanto mi resta"; i dettagli vengono dopo.
3. **Fatti, non giudizi.** Superare il budget è un'informazione, non una colpa: niente gamification, niente rimproveri.
4. **Poche cose, fatte bene.** Ogni funzionalità in più deve guadagnarsi il posto.

## Accessibility & Inclusion

Nessun requisito specifico dichiarato oltre a un buon livello di base: contrasto leggibile anche all'aperto, aree toccabili ampie, uso del tastierino numerico per gli importi.
