# Gestione spese personali — design

- **Data:** 2026-10-05
- **Stato:** bozza. Modello dati e API vanno confermati dopo le schermate di Stitch (vedi [Prossimi passi](#prossimi-passi)).
- **Decisioni:** il registro completo è in [`docs/DECISIONS.md`](../../DECISIONS.md).

## 1. Obiettivo

Web app personale per registrare e consultare le proprie spese **dallo smartphone**.

- **Utente:** una sola persona (la proprietaria del progetto). Nessun account, nessun multi-utente.
- **Uso:** sulla rete Wi-Fi di casa; backend e frontend girano sul Mac, il telefono apre l'app dal browser.
- **Successo:** inserire una spesa in pochi secondi e vedere subito quanto si è speso nel mese rispetto al budget.

## 2. Ambito (MVP)

Incluso:

1. Inserimento, modifica ed eliminazione delle spese.
2. Categorie gestibili dall'app (creare, rinominare, cambiare colore, eliminare se non in uso).
3. Riepilogo mensile: totale del mese, navigazione tra i mesi, ripartizione per categoria.
4. Budget mensile, impostabile in modo diverso per ogni mese.

Escluso (YAGNI): login, multi-utente, deploy online, spese ricorrenti, valute diverse dall'euro, import/export, offline/PWA, grafici storici su più mesi.

## 3. Architettura

```
Smartphone (browser)
   │  http://<ip-mac>:5173
   ▼
Vite dev server (FE React, host: true) ──proxy /api──▶ Spring Boot :8080 ──▶ H2 su file ./data/spese
```

- Il FE chiama sempre il percorso relativo `/api`: nessun CORS e nessun IP scritto nel codice.
- Due processi in sviluppo: `./mvnw spring-boot:run` (BE) e `npm run dev` (FE).
- In futuro il FE potrà essere servito da Spring Boot senza cambiare l'API.

## 4. Modello dati

### Category

| Campo | Tipo | Vincoli |
|---|---|---|
| `id` | Long | generato |
| `name` | String | obbligatorio, unico (senza distinzione tra maiuscole e minuscole), 1–30 caratteri, spazi esterni rimossi |
| `color` | String | obbligatorio, formato `#RRGGBB` |

Al primo avvio, se la tabella è vuota, vengono create: Spesa, Casa, Trasporti, Ristoranti, Svago, Salute, Altro con i colori evidenziatore di `DESIGN.md` (Spesa `#7EE08A`, Casa `#6CCBFF`, Trasporti `#FFE45C`, Ristoranti `#FFB050`, Svago `#FF8AC2`, Salute `#5FE0D2`, Altro `#D4D8E0`).

### Expense

| Campo | Tipo | Vincoli |
|---|---|---|
| `id` | Long | generato |
| `amount` | BigDecimal(10,2) | obbligatorio, > 0, massimo 2 decimali |
| `date` | LocalDate | obbligatoria (il FE propone oggi) |
| `description` | String | facoltativa, massimo 100 caratteri |
| `category` | Category | obbligatoria (ManyToOne) |

### MonthlyBudget

| Campo | Tipo | Vincoli |
|---|---|---|
| `id` | Long | generato |
| `month` | String `YYYY-MM` | obbligatorio, unico |
| `amount` | BigDecimal(10,2) | obbligatorio, > 0 |

**Regola del budget valido per il mese M:**
1. se esiste un budget per M, vale quello;
2. altrimenti vale il budget del mese più recente **precedente** a M;
3. altrimenti non c'è budget (`null`).

## 5. API REST (bozza)

Base: `/api`. JSON, date in formato ISO (`2026-10-05`), mesi `YYYY-MM`, importi come numeri decimali.

### Categorie

| Metodo | Percorso | Note |
|---|---|---|
| GET | `/categories` | ordinate per nome |
| POST | `/categories` | `{name, color}` → `201` |
| PUT | `/categories/{id}` | `{name, color}` |
| DELETE | `/categories/{id}` | `204`; `409` se esistono spese con questa categoria |

### Spese

| Metodo | Percorso | Note |
|---|---|---|
| GET | `/expenses?month=YYYY-MM` | `month` obbligatorio; ordinate per data decrescente, poi per id decrescente |
| GET | `/expenses/{id}` | |
| POST | `/expenses` | `{amount, date, description?, categoryId}` → `201` |
| PUT | `/expenses/{id}` | stesso corpo del POST |
| DELETE | `/expenses/{id}` | `204` |

Risposta di una spesa: `{id, amount, date, description, category: {id, name, color}}`.

### Budget

| Metodo | Percorso | Note |
|---|---|---|
| GET | `/budgets/{month}` | `{month, amount, sourceMonth}`: `amount` e `sourceMonth` sono `null` se non c'è budget; `sourceMonth ≠ month` se il budget è ereditato |
| PUT | `/budgets/{month}` | `{amount}`: crea o aggiorna il budget di quel mese |
| DELETE | `/budgets/{month}` | `204`: rimuove il budget specifico del mese (si torna a quello ereditato) |

### Riepilogo

`GET /summary?month=YYYY-MM` →

```json
{
  "month": "2026-10",
  "total": 842.50,
  "budget": 1200.00,
  "budgetSourceMonth": "2026-09",
  "remaining": 357.50,
  "byCategory": [
    { "categoryId": 1, "name": "Spesa", "color": "#4F7A5A", "total": 310.20 }
  ]
}
```

- `budget`, `budgetSourceMonth` e `remaining` sono `null` se non c'è budget; `remaining` può essere negativo.
- `byCategory` contiene solo le categorie con spese nel mese, ordinate per totale decrescente.

### Errori

Formato `ProblemDetail` (RFC 9457):

- `400`: validazione fallita o `month` non valido; il campo `errors` contiene `{campo: messaggio}`, con messaggi in italiano.
- `404`: risorsa (o `categoryId`) inesistente.
- `409`: nome di categoria duplicato, oppure categoria in uso al momento dell'eliminazione.

## 6. Backend

- Spring Boot 4.1.1, Java 25, pacchetto `com.example.demo`.
- `pom.xml`: rimuovere `postgresql`, `spring-boot-starter-websocket` e `spring-boot-starter-websocket-test`; aggiungere `com.h2database:h2` (runtime), `spring-boot-starter-validation` e il modulo della console H2 per Spring Boot 4 (artefatto da verificare in fase di implementazione).
- `application.properties`: `jdbc:h2:file:./data/spese`, `spring.jpa.hibernate.ddl-auto=update`, console H2 su `/h2-console`, `server.address=0.0.0.0`. `data/` va in `.gitignore`.
- Pacchetti per funzionalità:

```
category/  Category, CategoryRepository, CategoryService, CategoryController, CategoryRequest/Response
expense/   Expense, ExpenseRepository, ExpenseService, ExpenseController, ExpenseRequest/Response
budget/    MonthlyBudget, MonthlyBudgetRepository, BudgetService, BudgetController, DTO
summary/   SummaryService, SummaryController, SummaryResponse
common/    GlobalExceptionHandler, NotFoundException, ConflictException
config/    CategorySeeder (CommandLineRunner)
```

- Controller sottili → service con la logica → repository Spring Data. DTO come `record` con Bean Validation; le entità non escono dall'API.

## 7. Frontend (bozza funzionale, da allineare a Stitch)

- React 19 + Vite 8 + TypeScript, `react-router`, CSS puro con le variabili (token) di `DESIGN.md` (radice del progetto).
- Interfaccia in italiano; importi formattati con `Intl.NumberFormat('it-IT', {style: 'currency', currency: 'EUR'})`.
- Mobile-first: riferimento 390px; aree toccabili ≥ 44px; azioni principali raggiungibili col pollice.
- `vite.config.ts`: `server.host: true`, proxy `/api` → `http://localhost:8080`.

| Percorso | Schermata | Contenuto |
|---|---|---|
| `/` | Mese | selettore del mese; scheda di riepilogo (speso / budget / rimanente + barra); ripartizione per categoria; elenco delle spese raggruppate per giorno; pulsante "+" |
| `/spese/nuova`, `/spese/:id` | Spesa | importo grande (`inputmode="decimal"`), chip delle categorie, data (default oggi), descrizione; in modifica: "Elimina" con conferma dentro la pagina |
| `/categorie` | Categorie | elenco; crea, rinomina, cambia colore (palette); eliminazione con messaggio se è in uso |
| `/budget/:mese` | Budget | imposta o rimuove il budget del mese; mostra "ereditato da …" quando serve |

- Navigazione: barra a schede in basso (Mese · Categorie) + pulsante "+".
- `src/api/`: wrapper `fetch` tipizzato che converte i `ProblemDetail` in messaggi leggibili; un modulo per risorsa.
- Stati gestiti in ogni schermata: caricamento, vuoto, errore (per esempio il BE spento).

## 8. Test

- **BE (TDD):** unit test di `BudgetService` (mese esatto, mese precedente, nessun budget); `@DataJpaTest` per le query (spese del mese, totali per categoria, conteggio per categoria); test MockMvc per ogni controller (successo, 400, 404, 409).
- **FE:** Vitest + Testing Library per le utility (formattazione, navigazione tra mesi) e per il form della spesa (validazione e invio).
- **End-to-end manuale:** avviare BE e FE, aprire `http://<ip-mac>:5173` dal telefono, inserire una spesa, riavviare il BE e verificare che la spesa ci sia ancora.

## 9. Grafica e documentazione

```
docs/
  DECISIONS.md                     registro unico delle decisioni
  superpowers/specs/…-design.md    questa spec
  (radice) PRODUCT.md, DESIGN.md   fatti di prodotto e design system di Impeccable: stanno nella radice perché gli script di Impeccable li cercano lì
  design/stitch-prompt.md          prompt da incollare in Stitch, un blocco per schermata
  design/stitch/                   export delle schermate di Stitch (a cura dell'utente)
```

## Prossimi passi

1. Revisione di questa spec da parte dell'utente.
2. Impeccable → `PRODUCT.md` e `DESIGN.md` (seed) nella radice; scelto il mondo visivo "Diario scolastico".
3. Prompt per Stitch → `docs/design/stitch-prompt.md`; l'utente genera le schermate e le mette in `docs/design/stitch/`.
4. Verifica dei paragrafi 4–5 sulle schermate (per esempio icona della categoria, dati extra nel riepilogo); la spec passa da "bozza" ad "approvata".
5. Piano di implementazione (BE in TDD, poi FE).
