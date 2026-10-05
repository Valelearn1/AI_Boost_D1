# Backend "Diario spese" — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** API REST Spring Boot + H2 su file per spese, categorie, budget mensili e riepilogo del mese, come descritta nella spec.

**Architecture:** Un'app Spring Boot organizzata per funzionalità (`category`, `expense`, `budget`, `summary`, più `common` e `config`). Controller sottili → service con la logica e le transazioni → repository Spring Data JPA. I DTO sono `record` con Bean Validation, le entità non escono mai dall'API, gli errori sono `ProblemDetail`.

**Tech Stack:** Java 25, Spring Boot 4.1.1 (Web MVC, Data JPA/Hibernate, Validation), H2 2.x, Lombok, JUnit 5 + AssertJ + MockMvc.

**Spec:** `docs/superpowers/specs/2026-10-05-gestione-spese-design.md` (paragrafi 4, 5, 5bis, 6, 8). Le decisioni sono in `docs/DECISIONS.md`.

**Fuori da questo piano:** il frontend React. Avrà un piano separato, da scrivere quando le schermate di Stitch saranno in `docs/design/stitch/` (D-014).

## Global Constraints

- Tutti i comandi Maven si lanciano dalla cartella `BE/`: `./mvnw …`
- Pacchetto base `com.example.demo` (non rinominare).
- Base path dell'API: `/api`. JSON; date ISO `2026-10-05`; mesi `YYYY-MM`; importi come numeri decimali.
- Importi `BigDecimal`, colonna `precision = 10, scale = 2`, > 0, massimo 2 decimali.
- Nome di categoria: obbligatorio, 1–30 caratteri, spazi esterni rimossi, **unico senza distinzione tra maiuscole e minuscole**. Colore: `#RRGGBB`, salvato in maiuscolo.
- Descrizione della spesa: facoltativa, massimo 100 caratteri; se vuota dopo il trim viene salvata come `null`.
- Budget valido per il mese M: quello di M; altrimenti quello del mese più recente **precedente** a M; altrimenti nessuno (`null`).
- Errori: `ProblemDetail` (RFC 9457). `400` (con `errors: {campo: messaggio}` per la validazione), `404`, `409`. Messaggi **in italiano**.
- H2 su file `./data/spese` (relativo a `BE/`), cartella `data/` esclusa da git.
- Categorie iniziali, create solo se la tabella è vuota: Spesa `#7EE08A`, Casa `#6CCBFF`, Trasporti `#FFE45C`, Ristoranti `#FFB050`, Svago `#FF8AC2`, Salute `#5FE0D2`, Altro `#D4D8E0`.
- **Commit:** li fa l'utente. Ogni passo "Commit" indica solo i file e il messaggio da usare (una riga, forma nominale). Chi esegue il piano **non** lancia `git commit`.

## Review Focus

Input e condizioni che la spec implica senza nominarli, e che un'utente incontrerà sul serio. Ognuno ha un test nel task indicato.

1. **Nome di categoria che differisce solo per maiuscole o spazi** (`" casa "` quando esiste `Casa`): ci si aspetta un `409`, non un duplicato. → Task 4.
2. **Importi strani** (`0`, `-5`, `12.345`, campo mancante): ci si aspetta un `400` con il messaggio sul campo `amount`, mai un `500` o un salvataggio silenzioso. → Task 5.
3. **Spese a cavallo del mese** (30/9, 1/10, 31/10, 1/11) e mesi scritti male (`2026-13`, `10-2026`, parametro assente): il mese contiene esattamente i giorni dall'1 all'ultimo; formato errato → `400`. → Task 3 e Task 5.
4. **Data impossibile o JSON malformato** (`"2026-02-30"`, `{`): ci si aspetta un `400`, non un `500`. → Task 2 e Task 5.
5. **Budget di mesi successivi già impostati** (budget a dicembre, si guarda ottobre): ottobre **non** deve ereditare da dicembre, solo dai mesi precedenti. → Task 6.

---

## File Structure

```
BE/
  pom.xml                                        (modifica: dipendenze)
  .gitignore                                     (modifica: data/)
  src/main/resources/application.properties      (modifica: H2 su file, console, server)
  src/test/resources/application.properties      (nuovo: H2 in memoria, seed disattivato)
  src/main/java/com/example/demo/
    common/  Months, InvalidMonthException, NotFoundException, ConflictException, GlobalExceptionHandler
    category/ Category, CategoryRepository, CategoryRequest, CategoryResponse, CategoryService, CategoryController
    expense/  Expense, ExpenseRepository, CategoryTotal, CategoryCount, ExpenseRequest, ExpenseResponse, ExpenseService, ExpenseController
    budget/   MonthlyBudget, MonthlyBudgetRepository, BudgetRequest, BudgetResponse, BudgetService, BudgetController
    summary/  SummaryResponse, SummaryService, SummaryController
    config/   CategorySeeder
  src/test/java/com/example/demo/
    common/   MonthsTest, GlobalExceptionHandlerTest
    category/ CategoryRepositoryTest, CategoryControllerTest
    expense/  ExpenseRepositoryTest, ExpenseControllerTest
    budget/   MonthlyBudgetRepositoryTest, BudgetServiceTest, BudgetControllerTest
    summary/  SummaryControllerTest
    config/   CategorySeederTest
.gitignore                                       (nuovo, radice: .idea/, .impeccable/questions/)
```

Dipendenze tra pacchetti: `expense` usa `category` (entità e `CategoryService.find`); `category` usa `ExpenseRepository` solo per i conteggi; `summary` usa `expense` e `budget`.

---

### Task 1: Configurazione del progetto (H2, validation, profili di test)

**Files:**
- Modify: `BE/pom.xml` (blocco `<dependencies>`)
- Modify: `BE/src/main/resources/application.properties`
- Create: `BE/src/test/resources/application.properties`
- Modify: `BE/.gitignore`
- Create: `.gitignore` (radice)
- Test: `BE/src/test/java/com/example/demo/DemoApplicationTests.java` (esistente, invariato)

**Interfaces:**
- Produces: proprietà `app.seed.enabled` (default `true`; `false` nei test), usata da `CategorySeeder` (Task 4).

- [ ] **Step 1: Sostituire il blocco `<dependencies>` di `BE/pom.xml`**

Rimuove `postgresql`, `spring-boot-starter-websocket` e `spring-boot-starter-websocket-test` (D-004); aggiunge H2, validation e la console H2.

```xml
	<dependencies>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-data-jpa</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-webmvc</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-validation</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-h2console</artifactId>
		</dependency>

		<dependency>
			<groupId>com.h2database</groupId>
			<artifactId>h2</artifactId>
			<scope>runtime</scope>
		</dependency>
		<dependency>
			<groupId>org.projectlombok</groupId>
			<artifactId>lombok</artifactId>
			<optional>true</optional>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-data-jpa-test</artifactId>
			<scope>test</scope>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-webmvc-test</artifactId>
			<scope>test</scope>
		</dependency>
	</dependencies>
```

- [ ] **Step 2: Scrivere `BE/src/main/resources/application.properties`**

```properties
spring.application.name=diario-spese

# H2 su file: i dati restano tra un riavvio e l'altro (D-002)
spring.datasource.url=jdbc:h2:file:./data/spese
spring.datasource.username=sa
spring.datasource.password=
spring.jpa.hibernate.ddl-auto=update
spring.jpa.open-in-view=false

# Console H2 per il debug: http://localhost:8080/h2-console
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console

server.address=0.0.0.0
server.port=8080
```

- [ ] **Step 3: Creare `BE/src/test/resources/application.properties`**

Nei test questo file sostituisce quello principale (`test-classes` viene prima nel classpath).

```properties
spring.application.name=diario-spese-test
spring.datasource.url=jdbc:h2:mem:spese-test;DB_CLOSE_DELAY=-1
spring.jpa.hibernate.ddl-auto=create-drop
spring.h2.console.enabled=false
app.seed.enabled=false
```

- [ ] **Step 4: Aggiungere `data/` in fondo a `BE/.gitignore`**

```
### H2 ###
data/
```

- [ ] **Step 5: Creare `.gitignore` nella radice del progetto**

```
.idea/
.impeccable/questions/
```

- [ ] **Step 6: Verificare che il contesto parta con H2**

Run: `./mvnw test -Dtest=DemoApplicationTests`
Expected: `BUILD SUCCESS`, `Tests run: 1, Failures: 0, Errors: 0`.

- [ ] **Step 7: Commit (lo fa l'utente)**

File: `BE/pom.xml BE/.gitignore BE/src/main/resources/application.properties BE/src/test/resources/application.properties .gitignore`
Messaggio: `Configurazione del backend con H2 su file e rimozione di PostgreSQL e WebSocket`

---

### Task 2: Gestione degli errori e lettura del mese

**Files:**
- Create: `BE/src/main/java/com/example/demo/common/Months.java`
- Create: `BE/src/main/java/com/example/demo/common/InvalidMonthException.java`
- Create: `BE/src/main/java/com/example/demo/common/NotFoundException.java`
- Create: `BE/src/main/java/com/example/demo/common/ConflictException.java`
- Create: `BE/src/main/java/com/example/demo/common/GlobalExceptionHandler.java`
- Test: `BE/src/test/java/com/example/demo/common/MonthsTest.java`
- Test: `BE/src/test/java/com/example/demo/common/GlobalExceptionHandlerTest.java`

**Interfaces:**
- Produces: `Months.parse(String value): YearMonth` (lancia `InvalidMonthException`); `new NotFoundException(String message)` → 404; `new ConflictException(String message)` → 409; validazione `@Valid` → 400 con `errors`; JSON malformato o parametro mancante → 400.

- [ ] **Step 1: Scrivere il test di `Months`**

```java
package com.example.demo.common;

import org.junit.jupiter.api.Test;

import java.time.YearMonth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class MonthsTest {

    @Test
    void parsesIsoMonth() {
        assertThat(Months.parse("2026-10")).isEqualTo(YearMonth.of(2026, 10));
    }

    @Test
    void rejectsInvalidMonthNumber() {
        assertThatThrownBy(() -> Months.parse("2026-13"))
                .isInstanceOf(InvalidMonthException.class)
                .hasMessage("Mese non valido: «2026-13». Usa il formato AAAA-MM.");
    }

    @Test
    void rejectsWrongOrder() {
        assertThatThrownBy(() -> Months.parse("10-2026")).isInstanceOf(InvalidMonthException.class);
    }

    @Test
    void rejectsNull() {
        assertThatThrownBy(() -> Months.parse(null)).isInstanceOf(InvalidMonthException.class);
    }
}
```

- [ ] **Step 2: Verificare che fallisca**

Run: `./mvnw test -Dtest=MonthsTest`
Expected: errore di compilazione, `cannot find symbol: class Months`.

- [ ] **Step 3: Implementare `Months` e le eccezioni**

`InvalidMonthException.java`
```java
package com.example.demo.common;

public class InvalidMonthException extends RuntimeException {
    public InvalidMonthException(String value) {
        super("Mese non valido: «" + value + "». Usa il formato AAAA-MM.");
    }
}
```

`NotFoundException.java`
```java
package com.example.demo.common;

public class NotFoundException extends RuntimeException {
    public NotFoundException(String message) {
        super(message);
    }
}
```

`ConflictException.java`
```java
package com.example.demo.common;

public class ConflictException extends RuntimeException {
    public ConflictException(String message) {
        super(message);
    }
}
```

`Months.java`
```java
package com.example.demo.common;

import java.time.YearMonth;
import java.time.format.DateTimeParseException;

public final class Months {

    private Months() {
    }

    public static YearMonth parse(String value) {
        if (value == null) {
            throw new InvalidMonthException(null);
        }
        try {
            return YearMonth.parse(value);
        } catch (DateTimeParseException e) {
            throw new InvalidMonthException(value);
        }
    }
}
```

- [ ] **Step 4: Verificare che passi**

Run: `./mvnw test -Dtest=MonthsTest`
Expected: `Tests run: 4, Failures: 0, Errors: 0`.

- [ ] **Step 5: Scrivere il test del gestore degli errori**

Il controller di prova **non** è annotato `@RestController`: non deve finire nella scansione dei componenti degli altri test. Viene registrato a mano con `standaloneSetup`.

```java
package com.example.demo.common;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class GlobalExceptionHandlerTest {

    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        mvc = MockMvcBuilders.standaloneSetup(new TestController())
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void notFoundBecomes404ProblemDetail() throws Exception {
        mvc.perform(get("/test/not-found"))
                .andExpect(status().isNotFound())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.detail").value("Spesa 99 non trovata"));
    }

    @Test
    void conflictBecomes409() throws Exception {
        mvc.perform(get("/test/conflict"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail").value("Esiste già una categoria «Casa»"));
    }

    @Test
    void invalidMonthBecomes400() throws Exception {
        mvc.perform(get("/test/month").param("month", "2026-13"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Mese non valido: «2026-13». Usa il formato AAAA-MM."));
    }

    @Test
    void missingParameterBecomes400() throws Exception {
        mvc.perform(get("/test/month")).andExpect(status().isBadRequest());
    }

    @Test
    void validationErrorsAreListedPerField() throws Exception {
        mvc.perform(post("/test/validate").contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Dati non validi"))
                .andExpect(jsonPath("$.errors.name").value("Il nome è obbligatorio"));
    }

    @Test
    void malformedJsonBecomes400() throws Exception {
        mvc.perform(post("/test/validate").contentType(MediaType.APPLICATION_JSON).content("{"))
                .andExpect(status().isBadRequest());
    }

    @ResponseBody
    static class TestController {

        @GetMapping("/test/not-found")
        void notFound() {
            throw new NotFoundException("Spesa 99 non trovata");
        }

        @GetMapping("/test/conflict")
        void conflict() {
            throw new ConflictException("Esiste già una categoria «Casa»");
        }

        @GetMapping("/test/month")
        String month(@RequestParam String month) {
            return Months.parse(month).toString();
        }

        @PostMapping("/test/validate")
        void validate(@Valid @RequestBody Body body) {
        }

        record Body(@NotBlank(message = "Il nome è obbligatorio") String name) {
        }
    }
}
```

- [ ] **Step 6: Verificare che fallisca**

Run: `./mvnw test -Dtest=GlobalExceptionHandlerTest`
Expected: errore di compilazione, `cannot find symbol: class GlobalExceptionHandler`.

- [ ] **Step 7: Implementare `GlobalExceptionHandler`**

Estende `ResponseEntityExceptionHandler`, che trasforma già in `ProblemDetail` 400 il JSON malformato e i parametri mancanti.

```java
package com.example.demo.common;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler(NotFoundException.class)
    ProblemDetail handleNotFound(NotFoundException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(ConflictException.class)
    ProblemDetail handleConflict(ConflictException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, ex.getMessage());
    }

    @ExceptionHandler(InvalidMonthException.class)
    ProblemDetail handleInvalidMonth(InvalidMonthException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex, HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        Map<String, String> errors = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(error -> errors.putIfAbsent(error.getField(), error.getDefaultMessage()));
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Dati non validi");
        problem.setProperty("errors", errors);
        return ResponseEntity.badRequest().body(problem);
    }
}
```

- [ ] **Step 8: Verificare che passi**

Run: `./mvnw test -Dtest='MonthsTest,GlobalExceptionHandlerTest'`
Expected: `Tests run: 10, Failures: 0, Errors: 0`.

- [ ] **Step 9: Commit (lo fa l'utente)**

File: `BE/src/main/java/com/example/demo/common BE/src/test/java/com/example/demo/common`
Messaggio: `Aggiunta della gestione degli errori ProblemDetail e della lettura del mese`

---

### Task 3: Entità e repository

**Files:**
- Create: `BE/src/main/java/com/example/demo/category/Category.java`
- Create: `BE/src/main/java/com/example/demo/category/CategoryRepository.java`
- Create: `BE/src/main/java/com/example/demo/expense/Expense.java`
- Create: `BE/src/main/java/com/example/demo/expense/CategoryTotal.java`
- Create: `BE/src/main/java/com/example/demo/expense/CategoryCount.java`
- Create: `BE/src/main/java/com/example/demo/expense/ExpenseRepository.java`
- Create: `BE/src/main/java/com/example/demo/budget/MonthlyBudget.java`
- Create: `BE/src/main/java/com/example/demo/budget/MonthlyBudgetRepository.java`
- Test: `BE/src/test/java/com/example/demo/category/CategoryRepositoryTest.java`
- Test: `BE/src/test/java/com/example/demo/expense/ExpenseRepositoryTest.java`
- Test: `BE/src/test/java/com/example/demo/budget/MonthlyBudgetRepositoryTest.java`

**Interfaces:**
- Produces:
  - `Category(String name, String color)`; getter/setter `getId()`, `getName()`, `setName(String)`, `getColor()`, `setColor(String)`.
  - `CategoryRepository`: `List<Category> findAllByOrderByNameAsc()`, `boolean existsByNameIgnoreCase(String)`, `boolean existsByNameIgnoreCaseAndIdNot(String, Long)`.
  - `Expense(BigDecimal amount, LocalDate date, String description, Category category)`; getter/setter per `id`, `amount`, `date`, `description`, `category`.
  - `record CategoryTotal(Long categoryId, String name, String color, BigDecimal total)`.
  - `record CategoryCount(Long categoryId, Long count)`.
  - `ExpenseRepository`: `List<Expense> findByDateBetweenOrderByDateDescIdDesc(LocalDate from, LocalDate to)`, `long countByCategoryId(Long)`, `List<CategoryCount> countPerCategory()`, `List<CategoryTotal> totalsPerCategory(LocalDate from, LocalDate to)`.
  - `MonthlyBudget(String month, BigDecimal amount)`; getter/setter per `id`, `month`, `amount`.
  - `MonthlyBudgetRepository`: `Optional<MonthlyBudget> findByMonth(String)`, `Optional<MonthlyBudget> findFirstByMonthLessThanOrderByMonthDesc(String)`.

- [ ] **Step 1: Scrivere i test dei repository**

`CategoryRepositoryTest.java`
```java
package com.example.demo.category;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class CategoryRepositoryTest {

    @Autowired
    CategoryRepository categories;

    Category casa;

    @BeforeEach
    void setUp() {
        categories.save(new Category("Svago", "#FF8AC2"));
        casa = categories.save(new Category("Casa", "#6CCBFF"));
    }

    @Test
    void listsCategoriesByName() {
        assertThat(categories.findAllByOrderByNameAsc()).extracting(Category::getName)
                .containsExactly("Casa", "Svago");
    }

    @Test
    void findsNamesIgnoringCase() {
        assertThat(categories.existsByNameIgnoreCase("cASa")).isTrue();
        assertThat(categories.existsByNameIgnoreCase("Trasporti")).isFalse();
    }

    @Test
    void ignoresTheCategoryItselfWhenCheckingDuplicates() {
        assertThat(categories.existsByNameIgnoreCaseAndIdNot("CASA", casa.getId())).isFalse();
        assertThat(categories.existsByNameIgnoreCaseAndIdNot("svago", casa.getId())).isTrue();
    }
}
```

`ExpenseRepositoryTest.java`
```java
package com.example.demo.expense;

import com.example.demo.category.Category;
import com.example.demo.category.CategoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class ExpenseRepositoryTest {

    static final LocalDate OCT_1 = LocalDate.of(2026, 10, 1);
    static final LocalDate OCT_31 = LocalDate.of(2026, 10, 31);

    @Autowired
    CategoryRepository categories;

    @Autowired
    ExpenseRepository expenses;

    Category casa;
    Category spesa;

    @BeforeEach
    void setUp() {
        casa = categories.save(new Category("Casa", "#6CCBFF"));
        spesa = categories.save(new Category("Spesa", "#7EE08A"));
        expenses.save(new Expense(new BigDecimal("10.00"), LocalDate.of(2026, 9, 30), "Fine settembre", spesa));
        expenses.save(new Expense(new BigDecimal("650.00"), OCT_1, "Affitto", casa));
        expenses.save(new Expense(new BigDecimal("46.80"), LocalDate.of(2026, 10, 5), "Esselunga", spesa));
        expenses.save(new Expense(new BigDecimal("18.60"), OCT_31, "Mercato", spesa));
        expenses.save(new Expense(new BigDecimal("5.00"), LocalDate.of(2026, 11, 1), "Inizio novembre", casa));
    }

    @Test
    void findsOnlyTheMonthIncludingFirstAndLastDayNewestFirst() {
        List<Expense> october = expenses.findByDateBetweenOrderByDateDescIdDesc(OCT_1, OCT_31);

        assertThat(october).extracting(Expense::getDescription)
                .containsExactly("Mercato", "Esselunga", "Affitto");
    }

    @Test
    void ordersSameDayExpensesByMostRecentlyInserted() {
        expenses.save(new Expense(new BigDecimal("3.20"), LocalDate.of(2026, 10, 5), "Caffè e brioche", spesa));

        List<Expense> october = expenses.findByDateBetweenOrderByDateDescIdDesc(OCT_1, OCT_31);

        assertThat(october).extracting(Expense::getDescription)
                .containsExactly("Mercato", "Caffè e brioche", "Esselunga", "Affitto");
    }

    @Test
    void sumsTheMonthPerCategoryHighestFirst() {
        List<CategoryTotal> totals = expenses.totalsPerCategory(OCT_1, OCT_31);

        assertThat(totals).extracting(CategoryTotal::name).containsExactly("Casa", "Spesa");
        assertThat(totals.get(0).categoryId()).isEqualTo(casa.getId());
        assertThat(totals.get(0).color()).isEqualTo("#6CCBFF");
        assertThat(totals.get(0).total()).isEqualByComparingTo("650.00");
        assertThat(totals.get(1).total()).isEqualByComparingTo("65.40");
    }

    @Test
    void returnsNoTotalsForAnEmptyMonth() {
        assertThat(expenses.totalsPerCategory(LocalDate.of(2026, 12, 1), LocalDate.of(2026, 12, 31))).isEmpty();
    }

    @Test
    void countsExpensesPerCategoryAcrossAllMonths() {
        Map<Long, Long> counts = expenses.countPerCategory().stream()
                .collect(Collectors.toMap(CategoryCount::categoryId, CategoryCount::count));

        assertThat(counts).containsEntry(casa.getId(), 2L).containsEntry(spesa.getId(), 3L);
        assertThat(expenses.countByCategoryId(casa.getId())).isEqualTo(2L);
    }
}
```

`MonthlyBudgetRepositoryTest.java`
```java
package com.example.demo.budget;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class MonthlyBudgetRepositoryTest {

    @Autowired
    MonthlyBudgetRepository budgets;

    @BeforeEach
    void setUp() {
        budgets.save(new MonthlyBudget("2026-08", new BigDecimal("900.00")));
        budgets.save(new MonthlyBudget("2026-09", new BigDecimal("1200.00")));
        budgets.save(new MonthlyBudget("2026-12", new BigDecimal("1500.00")));
    }

    @Test
    void findsTheBudgetOfTheMonth() {
        assertThat(budgets.findByMonth("2026-09")).get()
                .extracting(MonthlyBudget::getAmount).isEqualTo(new BigDecimal("1200.00"));
        assertThat(budgets.findByMonth("2026-10")).isEmpty();
    }

    @Test
    void findsTheMostRecentEarlierBudgetIgnoringLaterOnes() {
        assertThat(budgets.findFirstByMonthLessThanOrderByMonthDesc("2026-10")).get()
                .extracting(MonthlyBudget::getMonth).isEqualTo("2026-09");
    }

    @Test
    void findsNothingBeforeTheFirstBudget() {
        assertThat(budgets.findFirstByMonthLessThanOrderByMonthDesc("2026-08")).isEmpty();
    }
}
```

- [ ] **Step 2: Verificare che falliscano**

Run: `./mvnw test -Dtest='CategoryRepositoryTest,ExpenseRepositoryTest,MonthlyBudgetRepositoryTest'`
Expected: errore di compilazione, `cannot find symbol: class Category`.

- [ ] **Step 3: Implementare entità e repository**

Le colonne si chiamano `expense_date` e `budget_month` perché `DATE` e `MONTH` sono parole chiave SQL.

`Category.java`
```java
package com.example.demo.category;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String name;

    @Column(nullable = false, length = 7)
    private String color;

    public Category(String name, String color) {
        this.name = name;
        this.color = color;
    }
}
```

`CategoryRepository.java`
```java
package com.example.demo.category;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findAllByOrderByNameAsc();

    boolean existsByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);
}
```

`Expense.java`
```java
package com.example.demo.expense;

import com.example.demo.category.Category;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "expense_date", nullable = false)
    private LocalDate date;

    @Column(length = 100)
    private String description;

    @ManyToOne(optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    public Expense(BigDecimal amount, LocalDate date, String description, Category category) {
        this.amount = amount;
        this.date = date;
        this.description = description;
        this.category = category;
    }
}
```

`CategoryTotal.java`
```java
package com.example.demo.expense;

import java.math.BigDecimal;

public record CategoryTotal(Long categoryId, String name, String color, BigDecimal total) {
}
```

`CategoryCount.java`
```java
package com.example.demo.expense;

public record CategoryCount(Long categoryId, Long count) {
}
```

`ExpenseRepository.java`
```java
package com.example.demo.expense;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    @EntityGraph(attributePaths = "category")
    List<Expense> findByDateBetweenOrderByDateDescIdDesc(LocalDate from, LocalDate to);

    long countByCategoryId(Long categoryId);

    @Query("select new com.example.demo.expense.CategoryCount(e.category.id, count(e)) "
            + "from Expense e group by e.category.id")
    List<CategoryCount> countPerCategory();

    @Query("select new com.example.demo.expense.CategoryTotal(c.id, c.name, c.color, sum(e.amount)) "
            + "from Expense e join e.category c "
            + "where e.date between :from and :to "
            + "group by c.id, c.name, c.color "
            + "order by sum(e.amount) desc")
    List<CategoryTotal> totalsPerCategory(@Param("from") LocalDate from, @Param("to") LocalDate to);
}
```

`MonthlyBudget.java`
```java
package com.example.demo.budget;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MonthlyBudget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "budget_month", nullable = false, unique = true, length = 7)
    private String month;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    public MonthlyBudget(String month, BigDecimal amount) {
        this.month = month;
        this.amount = amount;
    }
}
```

`MonthlyBudgetRepository.java`
```java
package com.example.demo.budget;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MonthlyBudgetRepository extends JpaRepository<MonthlyBudget, Long> {

    Optional<MonthlyBudget> findByMonth(String month);

    /** I mesi "YYYY-MM" si ordinano correttamente anche come stringhe. */
    Optional<MonthlyBudget> findFirstByMonthLessThanOrderByMonthDesc(String month);
}
```

- [ ] **Step 4: Verificare che passino**

Run: `./mvnw test -Dtest='CategoryRepositoryTest,ExpenseRepositoryTest,MonthlyBudgetRepositoryTest'`
Expected: `Tests run: 11, Failures: 0, Errors: 0`.

- [ ] **Step 5: Commit (lo fa l'utente)**

File: `BE/src/main/java/com/example/demo/category BE/src/main/java/com/example/demo/expense BE/src/main/java/com/example/demo/budget BE/src/test/java/com/example/demo`
Messaggio: `Aggiunta delle entità e dei repository di categorie, spese e budget`

---

### Task 4: API delle categorie e categorie iniziali

**Files:**
- Create: `BE/src/main/java/com/example/demo/category/CategoryRequest.java`
- Create: `BE/src/main/java/com/example/demo/category/CategoryResponse.java`
- Create: `BE/src/main/java/com/example/demo/category/CategoryService.java`
- Create: `BE/src/main/java/com/example/demo/category/CategoryController.java`
- Create: `BE/src/main/java/com/example/demo/config/CategorySeeder.java`
- Test: `BE/src/test/java/com/example/demo/category/CategoryControllerTest.java`
- Test: `BE/src/test/java/com/example/demo/config/CategorySeederTest.java`

**Interfaces:**
- Consumes: `CategoryRepository`, `ExpenseRepository.countPerCategory()`, `ExpenseRepository.countByCategoryId(Long)`, `NotFoundException`, `ConflictException`.
- Produces: `CategoryService.find(Long id): Category` (lancia `NotFoundException("Categoria {id} non trovata")`), usato da `ExpenseService` (Task 5); `record CategoryResponse(Long id, String name, String color, long expenseCount)`; endpoint `GET/POST /api/categories`, `PUT/DELETE /api/categories/{id}`.

- [ ] **Step 1: Scrivere il test del seeder**

```java
package com.example.demo.config;

import com.example.demo.category.Category;
import com.example.demo.category.CategoryRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class CategorySeederTest {

    @Autowired
    CategoryRepository categories;

    @Test
    void createsTheDefaultCategoriesWhenEmpty() {
        new CategorySeeder(categories).run();

        assertThat(categories.findAllByOrderByNameAsc())
                .extracting(Category::getName, Category::getColor)
                .containsExactly(
                        org.assertj.core.groups.Tuple.tuple("Altro", "#D4D8E0"),
                        org.assertj.core.groups.Tuple.tuple("Casa", "#6CCBFF"),
                        org.assertj.core.groups.Tuple.tuple("Ristoranti", "#FFB050"),
                        org.assertj.core.groups.Tuple.tuple("Salute", "#5FE0D2"),
                        org.assertj.core.groups.Tuple.tuple("Spesa", "#7EE08A"),
                        org.assertj.core.groups.Tuple.tuple("Svago", "#FF8AC2"),
                        org.assertj.core.groups.Tuple.tuple("Trasporti", "#FFE45C"));
    }

    @Test
    void doesNothingWhenCategoriesExist() {
        categories.save(new Category("Regali", "#C7A6FF"));

        new CategorySeeder(categories).run();

        assertThat(categories.count()).isEqualTo(1);
    }
}
```

- [ ] **Step 2: Scrivere il test del controller**

```java
package com.example.demo.category;

import com.example.demo.expense.Expense;
import com.example.demo.expense.ExpenseRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class CategoryControllerTest {

    @Autowired
    MockMvc mvc;

    @Autowired
    CategoryRepository categories;

    @Autowired
    ExpenseRepository expenses;

    Category casa;
    Category svago;

    @BeforeEach
    void setUp() {
        casa = categories.save(new Category("Casa", "#6CCBFF"));
        svago = categories.save(new Category("Svago", "#FF8AC2"));
        expenses.save(new Expense(new BigDecimal("650.00"), LocalDate.of(2026, 10, 1), "Affitto", casa));
    }

    @Test
    void listsCategoriesByNameWithExpenseCount() throws Exception {
        mvc.perform(get("/api/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].name").value("Casa"))
                .andExpect(jsonPath("$[0].color").value("#6CCBFF"))
                .andExpect(jsonPath("$[0].expenseCount").value(1))
                .andExpect(jsonPath("$[1].name").value("Svago"))
                .andExpect(jsonPath("$[1].expenseCount").value(0));
    }

    @Test
    void createsCategoryTrimmingNameAndUppercasingColor() throws Exception {
        mvc.perform(post("/api/categories").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name": "  Regali ", "color": "#c7a6ff"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.name").value("Regali"))
                .andExpect(jsonPath("$.color").value("#C7A6FF"))
                .andExpect(jsonPath("$.expenseCount").value(0));
    }

    @Test
    void rejectsDuplicateNameIgnoringCaseAndSpaces() throws Exception {
        mvc.perform(post("/api/categories").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name": " casa ", "color": "#6CCBFF"}
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail").value("Esiste già una categoria «casa»"));
    }

    @Test
    void rejectsInvalidCategory() throws Exception {
        mvc.perform(post("/api/categories").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name": "", "color": "blu"}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.name").value("Il nome è obbligatorio"))
                .andExpect(jsonPath("$.errors.color").value("Il colore deve essere nel formato #RRGGBB"));
    }

    @Test
    void rejectsNameLongerThan30Characters() throws Exception {
        mvc.perform(post("/api/categories").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name": "Una categoria con un nome troppo lungo", "color": "#6CCBFF"}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.name").value("Il nome può avere al massimo 30 caratteri"));
    }

    @Test
    void updatesCategory() throws Exception {
        mvc.perform(put("/api/categories/{id}", casa.getId()).contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name": "Casa e bollette", "color": "#5FE0D2"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Casa e bollette"))
                .andExpect(jsonPath("$.color").value("#5FE0D2"))
                .andExpect(jsonPath("$.expenseCount").value(1));
    }

    @Test
    void allowsChangingOnlyTheCaseOfItsOwnName() throws Exception {
        mvc.perform(put("/api/categories/{id}", casa.getId()).contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name": "CASA", "color": "#6CCBFF"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("CASA"));
    }

    @Test
    void rejectsRenamingToAnotherCategoryName() throws Exception {
        mvc.perform(put("/api/categories/{id}", casa.getId()).contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name": "svago", "color": "#6CCBFF"}
                                """))
                .andExpect(status().isConflict());
    }

    @Test
    void updatingMissingCategoryIs404() throws Exception {
        mvc.perform(put("/api/categories/{id}", 9999).contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name": "Nuova", "color": "#6CCBFF"}
                                """))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Categoria 9999 non trovata"));
    }

    @Test
    void deletesUnusedCategory() throws Exception {
        mvc.perform(delete("/api/categories/{id}", svago.getId()))
                .andExpect(status().isNoContent());
        mvc.perform(get("/api/categories"))
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void refusesToDeleteCategoryInUse() throws Exception {
        mvc.perform(delete("/api/categories/{id}", casa.getId()))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail").value("La categoria «Casa» ha 1 spesa"));
    }

    @Test
    void deleteMessageUsesPluralForManyExpenses() throws Exception {
        expenses.save(new Expense(new BigDecimal("72.40"), LocalDate.of(2026, 10, 2), "Bolletta luce", casa));

        mvc.perform(delete("/api/categories/{id}", casa.getId()))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail").value("La categoria «Casa» ha 2 spese"));
    }

    @Test
    void deletingMissingCategoryIs404() throws Exception {
        mvc.perform(delete("/api/categories/{id}", 9999))
                .andExpect(status().isNotFound());
    }
}
```

- [ ] **Step 3: Verificare che falliscano**

Run: `./mvnw test -Dtest='CategorySeederTest,CategoryControllerTest'`
Expected: errore di compilazione, `cannot find symbol: class CategorySeeder`.

- [ ] **Step 4: Implementare DTO, service, controller e seeder**

`CategoryRequest.java`
```java
package com.example.demo.category;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CategoryRequest(
        @NotBlank(message = "Il nome è obbligatorio")
        @Size(max = 30, message = "Il nome può avere al massimo 30 caratteri")
        String name,

        @NotBlank(message = "Il colore è obbligatorio")
        @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Il colore deve essere nel formato #RRGGBB")
        String color) {
}
```

`CategoryResponse.java`
```java
package com.example.demo.category;

public record CategoryResponse(Long id, String name, String color, long expenseCount) {

    static CategoryResponse of(Category category, long expenseCount) {
        return new CategoryResponse(category.getId(), category.getName(), category.getColor(), expenseCount);
    }
}
```

`CategoryService.java`
```java
package com.example.demo.category;

import com.example.demo.common.ConflictException;
import com.example.demo.common.NotFoundException;
import com.example.demo.expense.CategoryCount;
import com.example.demo.expense.ExpenseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class CategoryService {

    private final CategoryRepository categories;
    private final ExpenseRepository expenses;

    public CategoryService(CategoryRepository categories, ExpenseRepository expenses) {
        this.categories = categories;
        this.expenses = expenses;
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> list() {
        Map<Long, Long> counts = expenses.countPerCategory().stream()
                .collect(Collectors.toMap(CategoryCount::categoryId, CategoryCount::count));
        return categories.findAllByOrderByNameAsc().stream()
                .map(category -> CategoryResponse.of(category, counts.getOrDefault(category.getId(), 0L)))
                .toList();
    }

    public CategoryResponse create(CategoryRequest request) {
        String name = request.name().strip();
        if (categories.existsByNameIgnoreCase(name)) {
            throw duplicate(name);
        }
        Category saved = categories.save(new Category(name, request.color().toUpperCase()));
        return CategoryResponse.of(saved, 0);
    }

    public CategoryResponse update(Long id, CategoryRequest request) {
        Category category = find(id);
        String name = request.name().strip();
        if (categories.existsByNameIgnoreCaseAndIdNot(name, id)) {
            throw duplicate(name);
        }
        category.setName(name);
        category.setColor(request.color().toUpperCase());
        return CategoryResponse.of(category, expenses.countByCategoryId(id));
    }

    public void delete(Long id) {
        Category category = find(id);
        long count = expenses.countByCategoryId(id);
        if (count > 0) {
            throw new ConflictException("La categoria «" + category.getName() + "» ha " + count
                    + (count == 1 ? " spesa" : " spese"));
        }
        categories.delete(category);
    }

    @Transactional(readOnly = true)
    public Category find(Long id) {
        return categories.findById(id)
                .orElseThrow(() -> new NotFoundException("Categoria " + id + " non trovata"));
    }

    private static ConflictException duplicate(String name) {
        return new ConflictException("Esiste già una categoria «" + name + "»");
    }
}
```

`CategoryController.java`
```java
package com.example.demo.category;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService service;

    public CategoryController(CategoryService service) {
        this.service = service;
    }

    @GetMapping
    public List<CategoryResponse> list() {
        return service.list();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CategoryResponse create(@Valid @RequestBody CategoryRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public CategoryResponse update(@PathVariable Long id, @Valid @RequestBody CategoryRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
```

`CategorySeeder.java`
```java
package com.example.demo.config;

import com.example.demo.category.Category;
import com.example.demo.category.CategoryRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true", matchIfMissing = true)
public class CategorySeeder implements CommandLineRunner {

    private final CategoryRepository categories;

    public CategorySeeder(CategoryRepository categories) {
        this.categories = categories;
    }

    @Override
    public void run(String... args) {
        if (categories.count() > 0) {
            return;
        }
        categories.saveAll(List.of(
                new Category("Spesa", "#7EE08A"),
                new Category("Casa", "#6CCBFF"),
                new Category("Trasporti", "#FFE45C"),
                new Category("Ristoranti", "#FFB050"),
                new Category("Svago", "#FF8AC2"),
                new Category("Salute", "#5FE0D2"),
                new Category("Altro", "#D4D8E0")));
    }
}
```

- [ ] **Step 5: Verificare che passino**

Run: `./mvnw test -Dtest='CategorySeederTest,CategoryControllerTest'`
Expected: `Tests run: 15, Failures: 0, Errors: 0`.

- [ ] **Step 6: Commit (lo fa l'utente)**

File: `BE/src/main/java/com/example/demo/category BE/src/main/java/com/example/demo/config BE/src/test/java/com/example/demo/category BE/src/test/java/com/example/demo/config`
Messaggio: `Aggiunta dell'API delle categorie e delle categorie iniziali`

---

### Task 5: API delle spese

**Files:**
- Create: `BE/src/main/java/com/example/demo/expense/ExpenseRequest.java`
- Create: `BE/src/main/java/com/example/demo/expense/ExpenseResponse.java`
- Create: `BE/src/main/java/com/example/demo/expense/ExpenseService.java`
- Create: `BE/src/main/java/com/example/demo/expense/ExpenseController.java`
- Test: `BE/src/test/java/com/example/demo/expense/ExpenseControllerTest.java`

**Interfaces:**
- Consumes: `ExpenseRepository`, `CategoryService.find(Long): Category`, `Months.parse(String): YearMonth`, `NotFoundException`.
- Produces: `record ExpenseResponse(Long id, BigDecimal amount, LocalDate date, String description, CategoryRef category)` con `record CategoryRef(Long id, String name, String color)`; endpoint `GET /api/expenses?month=`, `GET/PUT/DELETE /api/expenses/{id}`, `POST /api/expenses`.

- [ ] **Step 1: Scrivere il test del controller**

```java
package com.example.demo.expense;

import com.example.demo.category.Category;
import com.example.demo.category.CategoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ExpenseControllerTest {

    @Autowired
    MockMvc mvc;

    @Autowired
    CategoryRepository categories;

    @Autowired
    ExpenseRepository expenses;

    Category casa;
    Category ristoranti;
    Expense pizzeria;

    @BeforeEach
    void setUp() {
        casa = categories.save(new Category("Casa", "#6CCBFF"));
        ristoranti = categories.save(new Category("Ristoranti", "#FFB050"));
        expenses.save(new Expense(new BigDecimal("72.40"), LocalDate.of(2026, 9, 30), "Bolletta", casa));
        expenses.save(new Expense(new BigDecimal("650.00"), LocalDate.of(2026, 10, 1), "Affitto", casa));
        pizzeria = expenses.save(new Expense(new BigDecimal("38.00"), LocalDate.of(2026, 10, 4), "Pizzeria Da Gino", ristoranti));
        expenses.save(new Expense(new BigDecimal("12.00"), LocalDate.of(2026, 11, 1), "Novembre", ristoranti));
    }

    @Test
    void listsExpensesOfTheMonthNewestFirstWithCategory() throws Exception {
        mvc.perform(get("/api/expenses").param("month", "2026-10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].description").value("Pizzeria Da Gino"))
                .andExpect(jsonPath("$[0].amount").value(38.0))
                .andExpect(jsonPath("$[0].date").value("2026-10-04"))
                .andExpect(jsonPath("$[0].category.name").value("Ristoranti"))
                .andExpect(jsonPath("$[0].category.color").value("#FFB050"))
                .andExpect(jsonPath("$[1].description").value("Affitto"));
    }

    @Test
    void listForAnEmptyMonthIsEmpty() throws Exception {
        mvc.perform(get("/api/expenses").param("month", "2026-12"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void listRejectsInvalidOrMissingMonth() throws Exception {
        mvc.perform(get("/api/expenses").param("month", "2026-13")).andExpect(status().isBadRequest());
        mvc.perform(get("/api/expenses").param("month", "10-2026")).andExpect(status().isBadRequest());
        mvc.perform(get("/api/expenses")).andExpect(status().isBadRequest());
    }

    @Test
    void createsExpenseTrimmingDescription() throws Exception {
        mvc.perform(post("/api/expenses").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"amount": 3.20, "date": "2026-10-05", "description": "  Caffè e brioche ", "categoryId": %d}
                                """.formatted(ristoranti.getId())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.amount").value(3.2))
                .andExpect(jsonPath("$.description").value("Caffè e brioche"))
                .andExpect(jsonPath("$.category.id").value(ristoranti.getId()));
    }

    @Test
    void blankDescriptionIsStoredAsNull() throws Exception {
        mvc.perform(post("/api/expenses").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"amount": 5, "date": "2026-10-05", "description": "   ", "categoryId": %d}
                                """.formatted(casa.getId())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.description").value(nullValue()));
    }

    @Test
    void rejectsZeroNegativeAndTooPreciseAmounts() throws Exception {
        for (String amount : new String[] {"0", "-5", "12.345"}) {
            mvc.perform(post("/api/expenses").contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"amount": %s, "date": "2026-10-05", "categoryId": %d}
                                    """.formatted(amount, casa.getId())))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.errors.amount").exists());
        }
    }

    @Test
    void rejectsMissingFields() throws Exception {
        mvc.perform(post("/api/expenses").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.amount").value("L'importo è obbligatorio"))
                .andExpect(jsonPath("$.errors.date").value("La data è obbligatoria"))
                .andExpect(jsonPath("$.errors.categoryId").value("La categoria è obbligatoria"));
    }

    @Test
    void rejectsDescriptionLongerThan100Characters() throws Exception {
        mvc.perform(post("/api/expenses").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"amount": 5, "date": "2026-10-05", "description": "%s", "categoryId": %d}
                                """.formatted("x".repeat(101), casa.getId())))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.description").value("La descrizione può avere al massimo 100 caratteri"));
    }

    @Test
    void rejectsImpossibleDate() throws Exception {
        mvc.perform(post("/api/expenses").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"amount": 5, "date": "2026-02-30", "categoryId": %d}
                                """.formatted(casa.getId())))
                .andExpect(status().isBadRequest());
    }

    @Test
    void unknownCategoryIs404() throws Exception {
        mvc.perform(post("/api/expenses").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"amount": 5, "date": "2026-10-05", "categoryId": 9999}
                                """))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Categoria 9999 non trovata"));
    }

    @Test
    void getsOneExpense() throws Exception {
        mvc.perform(get("/api/expenses/{id}", pizzeria.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.description").value("Pizzeria Da Gino"));
    }

    @Test
    void missingExpenseIs404() throws Exception {
        mvc.perform(get("/api/expenses/{id}", 9999))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Spesa 9999 non trovata"));
    }

    @Test
    void updatesExpenseIncludingCategory() throws Exception {
        mvc.perform(put("/api/expenses/{id}", pizzeria.getId()).contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"amount": 40.50, "date": "2026-10-03", "description": "Cena", "categoryId": %d}
                                """.formatted(casa.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.amount").value(40.5))
                .andExpect(jsonPath("$.date").value("2026-10-03"))
                .andExpect(jsonPath("$.description").value("Cena"))
                .andExpect(jsonPath("$.category.name").value("Casa"));
    }

    @Test
    void updatingMissingExpenseIs404() throws Exception {
        mvc.perform(put("/api/expenses/{id}", 9999).contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"amount": 1, "date": "2026-10-03", "categoryId": %d}
                                """.formatted(casa.getId())))
                .andExpect(status().isNotFound());
    }

    @Test
    void deletesExpense() throws Exception {
        mvc.perform(delete("/api/expenses/{id}", pizzeria.getId()))
                .andExpect(status().isNoContent());
        mvc.perform(get("/api/expenses/{id}", pizzeria.getId()))
                .andExpect(status().isNotFound());
    }
}
```

- [ ] **Step 2: Verificare che fallisca**

Run: `./mvnw test -Dtest=ExpenseControllerTest`
Expected: i test falliscono con `404` invece degli stati attesi, perché nessun controller gestisce `/api/expenses`. (Il test compila: usa solo classi del Task 3.)

- [ ] **Step 3: Implementare DTO, service e controller**

`ExpenseRequest.java`
```java
package com.example.demo.expense;

import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ExpenseRequest(
        @NotNull(message = "L'importo è obbligatorio")
        @Positive(message = "L'importo deve essere maggiore di zero")
        @Digits(integer = 8, fraction = 2, message = "L'importo può avere al massimo 2 decimali")
        BigDecimal amount,

        @NotNull(message = "La data è obbligatoria")
        LocalDate date,

        @Size(max = 100, message = "La descrizione può avere al massimo 100 caratteri")
        String description,

        @NotNull(message = "La categoria è obbligatoria")
        Long categoryId) {
}
```

`ExpenseResponse.java`
```java
package com.example.demo.expense;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ExpenseResponse(Long id, BigDecimal amount, LocalDate date, String description, CategoryRef category) {

    public record CategoryRef(Long id, String name, String color) {
    }

    static ExpenseResponse of(Expense expense) {
        var category = expense.getCategory();
        return new ExpenseResponse(expense.getId(), expense.getAmount(), expense.getDate(), expense.getDescription(),
                new CategoryRef(category.getId(), category.getName(), category.getColor()));
    }
}
```

`ExpenseService.java`
```java
package com.example.demo.expense;

import com.example.demo.category.Category;
import com.example.demo.category.CategoryService;
import com.example.demo.common.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.YearMonth;
import java.util.List;

@Service
@Transactional
public class ExpenseService {

    private final ExpenseRepository expenses;
    private final CategoryService categoryService;

    public ExpenseService(ExpenseRepository expenses, CategoryService categoryService) {
        this.expenses = expenses;
        this.categoryService = categoryService;
    }

    @Transactional(readOnly = true)
    public List<ExpenseResponse> listByMonth(YearMonth month) {
        return expenses.findByDateBetweenOrderByDateDescIdDesc(month.atDay(1), month.atEndOfMonth()).stream()
                .map(ExpenseResponse::of)
                .toList();
    }

    @Transactional(readOnly = true)
    public ExpenseResponse get(Long id) {
        return ExpenseResponse.of(find(id));
    }

    public ExpenseResponse create(ExpenseRequest request) {
        Category category = categoryService.find(request.categoryId());
        Expense saved = expenses.save(
                new Expense(request.amount(), request.date(), normalize(request.description()), category));
        return ExpenseResponse.of(saved);
    }

    public ExpenseResponse update(Long id, ExpenseRequest request) {
        Expense expense = find(id);
        expense.setAmount(request.amount());
        expense.setDate(request.date());
        expense.setDescription(normalize(request.description()));
        expense.setCategory(categoryService.find(request.categoryId()));
        return ExpenseResponse.of(expense);
    }

    public void delete(Long id) {
        expenses.delete(find(id));
    }

    private Expense find(Long id) {
        return expenses.findById(id)
                .orElseThrow(() -> new NotFoundException("Spesa " + id + " non trovata"));
    }

    private static String normalize(String description) {
        if (description == null) {
            return null;
        }
        String stripped = description.strip();
        return stripped.isEmpty() ? null : stripped;
    }
}
```

`ExpenseController.java`
```java
package com.example.demo.expense;

import com.example.demo.common.Months;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    private final ExpenseService service;

    public ExpenseController(ExpenseService service) {
        this.service = service;
    }

    @GetMapping
    public List<ExpenseResponse> list(@RequestParam String month) {
        return service.listByMonth(Months.parse(month));
    }

    @GetMapping("/{id}")
    public ExpenseResponse get(@PathVariable Long id) {
        return service.get(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ExpenseResponse create(@Valid @RequestBody ExpenseRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public ExpenseResponse update(@PathVariable Long id, @Valid @RequestBody ExpenseRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
```

- [ ] **Step 4: Verificare che passi**

Run: `./mvnw test -Dtest=ExpenseControllerTest`
Expected: `Tests run: 15, Failures: 0, Errors: 0`.

- [ ] **Step 5: Commit (lo fa l'utente)**

File: `BE/src/main/java/com/example/demo/expense BE/src/test/java/com/example/demo/expense`
Messaggio: `Aggiunta dell'API delle spese`

---

### Task 6: Budget mensile con ereditarietà

**Files:**
- Create: `BE/src/main/java/com/example/demo/budget/BudgetRequest.java`
- Create: `BE/src/main/java/com/example/demo/budget/BudgetResponse.java`
- Create: `BE/src/main/java/com/example/demo/budget/BudgetService.java`
- Create: `BE/src/main/java/com/example/demo/budget/BudgetController.java`
- Test: `BE/src/test/java/com/example/demo/budget/BudgetServiceTest.java`
- Test: `BE/src/test/java/com/example/demo/budget/BudgetControllerTest.java`

**Interfaces:**
- Consumes: `MonthlyBudgetRepository`, `Months.parse(String)`.
- Produces: `record BudgetResponse(String month, BigDecimal amount, String sourceMonth)`; `BudgetService.effective(YearMonth): BudgetResponse` (usato da `SummaryService`, Task 7), `BudgetService.set(YearMonth, BigDecimal): BudgetResponse`, `BudgetService.remove(YearMonth): void`; endpoint `GET/PUT/DELETE /api/budgets/{month}`.

- [ ] **Step 1: Scrivere il test del service (la regola del budget valido)**

```java
package com.example.demo.budget;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.context.annotation.Import;

import java.math.BigDecimal;
import java.time.YearMonth;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@Import(BudgetService.class)
class BudgetServiceTest {

    static final YearMonth OCTOBER = YearMonth.of(2026, 10);

    @Autowired
    BudgetService service;

    @Autowired
    MonthlyBudgetRepository budgets;

    @Test
    void usesTheBudgetOfTheMonthItself() {
        budgets.save(new MonthlyBudget("2026-09", new BigDecimal("1200.00")));
        budgets.save(new MonthlyBudget("2026-10", new BigDecimal("1300.00")));

        BudgetResponse result = service.effective(OCTOBER);

        assertThat(result.month()).isEqualTo("2026-10");
        assertThat(result.amount()).isEqualByComparingTo("1300.00");
        assertThat(result.sourceMonth()).isEqualTo("2026-10");
    }

    @Test
    void inheritsTheMostRecentEarlierBudget() {
        budgets.save(new MonthlyBudget("2026-07", new BigDecimal("900.00")));
        budgets.save(new MonthlyBudget("2026-09", new BigDecimal("1200.00")));

        BudgetResponse result = service.effective(OCTOBER);

        assertThat(result.amount()).isEqualByComparingTo("1200.00");
        assertThat(result.sourceMonth()).isEqualTo("2026-09");
    }

    @Test
    void neverInheritsFromLaterMonths() {
        budgets.save(new MonthlyBudget("2026-12", new BigDecimal("1500.00")));

        BudgetResponse result = service.effective(OCTOBER);

        assertThat(result.month()).isEqualTo("2026-10");
        assertThat(result.amount()).isNull();
        assertThat(result.sourceMonth()).isNull();
    }

    @Test
    void setCreatesThenUpdatesTheBudgetOfTheMonth() {
        service.set(OCTOBER, new BigDecimal("1000.00"));
        BudgetResponse updated = service.set(OCTOBER, new BigDecimal("1100.00"));

        assertThat(updated.amount()).isEqualByComparingTo("1100.00");
        assertThat(updated.sourceMonth()).isEqualTo("2026-10");
        assertThat(budgets.count()).isEqualTo(1);
    }

    @Test
    void removeFallsBackToTheInheritedBudget() {
        budgets.save(new MonthlyBudget("2026-09", new BigDecimal("1200.00")));
        service.set(OCTOBER, new BigDecimal("1300.00"));

        service.remove(OCTOBER);

        assertThat(service.effective(OCTOBER).sourceMonth()).isEqualTo("2026-09");
    }

    @Test
    void removeWithoutOwnBudgetDoesNothing() {
        budgets.save(new MonthlyBudget("2026-09", new BigDecimal("1200.00")));

        service.remove(OCTOBER);

        assertThat(budgets.count()).isEqualTo(1);
    }
}
```

- [ ] **Step 2: Scrivere il test del controller**

```java
package com.example.demo.budget;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class BudgetControllerTest {

    @Autowired
    MockMvc mvc;

    @Autowired
    MonthlyBudgetRepository budgets;

    @Test
    void returnsInheritedBudget() throws Exception {
        budgets.save(new MonthlyBudget("2026-09", new BigDecimal("1200.00")));

        mvc.perform(get("/api/budgets/2026-10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.month").value("2026-10"))
                .andExpect(jsonPath("$.amount").value(1200.0))
                .andExpect(jsonPath("$.sourceMonth").value("2026-09"));
    }

    @Test
    void returnsNullsWhenThereIsNoBudget() throws Exception {
        mvc.perform(get("/api/budgets/2026-10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.amount").value(nullValue()))
                .andExpect(jsonPath("$.sourceMonth").value(nullValue()));
    }

    @Test
    void setsTheBudgetOfTheMonth() throws Exception {
        mvc.perform(put("/api/budgets/2026-10").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"amount": 1300.00}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.amount").value(1300.0))
                .andExpect(jsonPath("$.sourceMonth").value("2026-10"));
    }

    @Test
    void rejectsInvalidAmount() throws Exception {
        mvc.perform(put("/api/budgets/2026-10").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"amount": 0}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.amount").value("Il budget deve essere maggiore di zero"));
    }

    @Test
    void rejectsInvalidMonth() throws Exception {
        mvc.perform(get("/api/budgets/ottobre")).andExpect(status().isBadRequest());
    }

    @Test
    void deletesTheBudgetOfTheMonth() throws Exception {
        budgets.save(new MonthlyBudget("2026-10", new BigDecimal("1300.00")));

        mvc.perform(delete("/api/budgets/2026-10")).andExpect(status().isNoContent());
        mvc.perform(get("/api/budgets/2026-10"))
                .andExpect(jsonPath("$.amount").value(nullValue()));
    }
}
```

- [ ] **Step 3: Verificare che falliscano**

Run: `./mvnw test -Dtest='BudgetServiceTest,BudgetControllerTest'`
Expected: errore di compilazione, `cannot find symbol: class BudgetService`.

- [ ] **Step 4: Implementare DTO, service e controller**

`BudgetRequest.java`
```java
package com.example.demo.budget;

import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record BudgetRequest(
        @NotNull(message = "Il budget è obbligatorio")
        @Positive(message = "Il budget deve essere maggiore di zero")
        @Digits(integer = 8, fraction = 2, message = "Il budget può avere al massimo 2 decimali")
        BigDecimal amount) {
}
```

`BudgetResponse.java`
```java
package com.example.demo.budget;

import java.math.BigDecimal;

/** {@code amount} e {@code sourceMonth} sono null se non c'è budget; sourceMonth ≠ month se ereditato. */
public record BudgetResponse(String month, BigDecimal amount, String sourceMonth) {
}
```

`BudgetService.java`
```java
package com.example.demo.budget;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.YearMonth;

@Service
@Transactional
public class BudgetService {

    private final MonthlyBudgetRepository budgets;

    public BudgetService(MonthlyBudgetRepository budgets) {
        this.budgets = budgets;
    }

    @Transactional(readOnly = true)
    public BudgetResponse effective(YearMonth month) {
        String key = month.toString();
        return budgets.findByMonth(key)
                .or(() -> budgets.findFirstByMonthLessThanOrderByMonthDesc(key))
                .map(budget -> new BudgetResponse(key, budget.getAmount(), budget.getMonth()))
                .orElse(new BudgetResponse(key, null, null));
    }

    public BudgetResponse set(YearMonth month, BigDecimal amount) {
        String key = month.toString();
        MonthlyBudget budget = budgets.findByMonth(key)
                .orElseGet(() -> new MonthlyBudget(key, amount));
        budget.setAmount(amount);
        budgets.save(budget);
        return new BudgetResponse(key, amount, key);
    }

    public void remove(YearMonth month) {
        budgets.findByMonth(month.toString()).ifPresent(budgets::delete);
    }
}
```

`BudgetController.java`
```java
package com.example.demo.budget;

import com.example.demo.common.Months;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    private final BudgetService service;

    public BudgetController(BudgetService service) {
        this.service = service;
    }

    @GetMapping("/{month}")
    public BudgetResponse get(@PathVariable String month) {
        return service.effective(Months.parse(month));
    }

    @PutMapping("/{month}")
    public BudgetResponse set(@PathVariable String month, @Valid @RequestBody BudgetRequest request) {
        return service.set(Months.parse(month), request.amount());
    }

    @DeleteMapping("/{month}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String month) {
        service.remove(Months.parse(month));
    }
}
```

- [ ] **Step 5: Verificare che passino**

Run: `./mvnw test -Dtest='BudgetServiceTest,BudgetControllerTest'`
Expected: `Tests run: 12, Failures: 0, Errors: 0`.

- [ ] **Step 6: Commit (lo fa l'utente)**

File: `BE/src/main/java/com/example/demo/budget BE/src/test/java/com/example/demo/budget`
Messaggio: `Aggiunta del budget mensile con ereditarietà dai mesi precedenti`

---

### Task 7: Riepilogo del mese

**Files:**
- Create: `BE/src/main/java/com/example/demo/summary/SummaryResponse.java`
- Create: `BE/src/main/java/com/example/demo/summary/SummaryService.java`
- Create: `BE/src/main/java/com/example/demo/summary/SummaryController.java`
- Test: `BE/src/test/java/com/example/demo/summary/SummaryControllerTest.java`

**Interfaces:**
- Consumes: `ExpenseRepository.totalsPerCategory(LocalDate, LocalDate): List<CategoryTotal>`, `BudgetService.effective(YearMonth): BudgetResponse`, `Months.parse(String)`.
- Produces: `record SummaryResponse(String month, BigDecimal total, BigDecimal budget, String budgetSourceMonth, BigDecimal remaining, List<CategoryTotal> byCategory)`; endpoint `GET /api/summary?month=`.

- [ ] **Step 1: Scrivere il test**

Usa i dati di ottobre delle schermate (spec 5bis).

```java
package com.example.demo.summary;

import com.example.demo.budget.MonthlyBudget;
import com.example.demo.budget.MonthlyBudgetRepository;
import com.example.demo.category.Category;
import com.example.demo.category.CategoryRepository;
import com.example.demo.expense.Expense;
import com.example.demo.expense.ExpenseRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class SummaryControllerTest {

    @Autowired
    MockMvc mvc;

    @Autowired
    CategoryRepository categories;

    @Autowired
    ExpenseRepository expenses;

    @Autowired
    MonthlyBudgetRepository budgets;

    Category casa;

    @BeforeEach
    void setUp() {
        casa = categories.save(new Category("Casa", "#6CCBFF"));
        Category trasporti = categories.save(new Category("Trasporti", "#FFE45C"));
        Category spesa = categories.save(new Category("Spesa", "#7EE08A"));
        expenses.save(new Expense(new BigDecimal("650.00"), LocalDate.of(2026, 10, 1), "Affitto", casa));
        expenses.save(new Expense(new BigDecimal("72.40"), LocalDate.of(2026, 10, 2), "Bolletta luce", casa));
        expenses.save(new Expense(new BigDecimal("39.00"), LocalDate.of(2026, 10, 1), "Abbonamento ATM", trasporti));
        expenses.save(new Expense(new BigDecimal("60.00"), LocalDate.of(2026, 10, 3), "Benzina", trasporti));
        expenses.save(new Expense(new BigDecimal("46.80"), LocalDate.of(2026, 10, 5), "Esselunga", spesa));
        expenses.save(new Expense(new BigDecimal("99.99"), LocalDate.of(2026, 9, 28), "Settembre", spesa));
    }

    @Test
    void summarizesTheMonthWithInheritedBudget() throws Exception {
        budgets.save(new MonthlyBudget("2026-09", new BigDecimal("1200.00")));

        mvc.perform(get("/api/summary").param("month", "2026-10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.month").value("2026-10"))
                .andExpect(jsonPath("$.total").value(868.2))
                .andExpect(jsonPath("$.budget").value(1200.0))
                .andExpect(jsonPath("$.budgetSourceMonth").value("2026-09"))
                .andExpect(jsonPath("$.remaining").value(331.8))
                .andExpect(jsonPath("$.byCategory.length()").value(3))
                .andExpect(jsonPath("$.byCategory[0].categoryId").value(casa.getId()))
                .andExpect(jsonPath("$.byCategory[0].name").value("Casa"))
                .andExpect(jsonPath("$.byCategory[0].color").value("#6CCBFF"))
                .andExpect(jsonPath("$.byCategory[0].total").value(722.4))
                .andExpect(jsonPath("$.byCategory[1].name").value("Trasporti"))
                .andExpect(jsonPath("$.byCategory[2].name").value("Spesa"));
    }

    @Test
    void remainingIsNegativeWhenOverBudget() throws Exception {
        budgets.save(new MonthlyBudget("2026-10", new BigDecimal("800.00")));

        mvc.perform(get("/api/summary").param("month", "2026-10"))
                .andExpect(jsonPath("$.remaining").value(-68.2));
    }

    @Test
    void budgetFieldsAreNullWithoutBudget() throws Exception {
        mvc.perform(get("/api/summary").param("month", "2026-10"))
                .andExpect(jsonPath("$.budget").value(nullValue()))
                .andExpect(jsonPath("$.budgetSourceMonth").value(nullValue()))
                .andExpect(jsonPath("$.remaining").value(nullValue()));
    }

    @Test
    void emptyMonthHasZeroTotalAndNoCategories() throws Exception {
        mvc.perform(get("/api/summary").param("month", "2026-12"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(0))
                .andExpect(jsonPath("$.byCategory.length()").value(0));
    }

    @Test
    void rejectsInvalidMonth() throws Exception {
        mvc.perform(get("/api/summary").param("month", "2026-00")).andExpect(status().isBadRequest());
    }
}
```

- [ ] **Step 2: Verificare che fallisca**

Run: `./mvnw test -Dtest=SummaryControllerTest`
Expected: i test falliscono con `404`, perché nessun controller gestisce `/api/summary`.

- [ ] **Step 3: Implementare risposta, service e controller**

`SummaryResponse.java`
```java
package com.example.demo.summary;

import com.example.demo.expense.CategoryTotal;

import java.math.BigDecimal;
import java.util.List;

public record SummaryResponse(
        String month,
        BigDecimal total,
        BigDecimal budget,
        String budgetSourceMonth,
        BigDecimal remaining,
        List<CategoryTotal> byCategory) {
}
```

`SummaryService.java`
```java
package com.example.demo.summary;

import com.example.demo.budget.BudgetResponse;
import com.example.demo.budget.BudgetService;
import com.example.demo.expense.CategoryTotal;
import com.example.demo.expense.ExpenseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class SummaryService {

    private final ExpenseRepository expenses;
    private final BudgetService budgets;

    public SummaryService(ExpenseRepository expenses, BudgetService budgets) {
        this.expenses = expenses;
        this.budgets = budgets;
    }

    public SummaryResponse forMonth(YearMonth month) {
        List<CategoryTotal> byCategory = expenses.totalsPerCategory(month.atDay(1), month.atEndOfMonth());
        BigDecimal total = byCategory.stream()
                .map(CategoryTotal::total)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BudgetResponse budget = budgets.effective(month);
        BigDecimal remaining = budget.amount() == null ? null : budget.amount().subtract(total);
        return new SummaryResponse(month.toString(), total, budget.amount(), budget.sourceMonth(), remaining, byCategory);
    }
}
```

`SummaryController.java`
```java
package com.example.demo.summary;

import com.example.demo.common.Months;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/summary")
public class SummaryController {

    private final SummaryService service;

    public SummaryController(SummaryService service) {
        this.service = service;
    }

    @GetMapping
    public SummaryResponse get(@RequestParam String month) {
        return service.forMonth(Months.parse(month));
    }
}
```

- [ ] **Step 4: Verificare che passi**

Run: `./mvnw test -Dtest=SummaryControllerTest`
Expected: `Tests run: 5, Failures: 0, Errors: 0`.

- [ ] **Step 5: Commit (lo fa l'utente)**

File: `BE/src/main/java/com/example/demo/summary BE/src/test/java/com/example/demo/summary`
Messaggio: `Aggiunta del riepilogo mensile con totali per categoria e rimanente`

---

### Task 8: Verifica completa e prova reale con persistenza

**Files:** nessuna modifica al codice. Se emergono problemi, si correggono nel task che possiede il codice.

- [ ] **Step 1: Lanciare tutta la suite**

Run: `./mvnw test`
Expected: `BUILD SUCCESS`, `Tests run: 69, Failures: 0, Errors: 0`. Il totale è: 1 (DemoApplicationTests) + 10 (Task 2) + 11 (Task 3) + 15 (Task 4) + 15 (Task 5) + 12 (Task 6) + 5 (Task 7) = 69. Se il numero è diverso, verificare che non manchi una classe di test; **non** aggiustare il conteggio a mano.

- [ ] **Step 2: Avviare l'app**

Run (in un terminale a parte, dalla cartella `BE/`): `./mvnw spring-boot:run`
Expected: log con `Tomcat started on port 8080` e creazione del file `BE/data/spese.mv.db`.

- [ ] **Step 3: Verificare le categorie iniziali e creare dati di prova**

```bash
curl -s localhost:8080/api/categories
# Atteso: 7 categorie (Altro, Casa, Ristoranti, Salute, Spesa, Svago, Trasporti), expenseCount 0

CASA=$(curl -s localhost:8080/api/categories | python3 -c "import sys,json; print([c['id'] for c in json.load(sys.stdin) if c['name']=='Casa'][0])")
curl -s -X POST localhost:8080/api/expenses -H 'Content-Type: application/json' \
  -d "{\"amount\": 650.00, \"date\": \"2026-10-01\", \"description\": \"Affitto\", \"categoryId\": $CASA}"
curl -s -X PUT localhost:8080/api/budgets/2026-09 -H 'Content-Type: application/json' -d '{"amount": 1200.00}'
curl -s "localhost:8080/api/summary?month=2026-10"
# Atteso: total 650.00, budget 1200.00, budgetSourceMonth "2026-09", remaining 550.00
curl -s -X DELETE -o /dev/null -w "%{http_code}\n" localhost:8080/api/categories/$CASA
# Atteso: 409
```

- [ ] **Step 4: Verificare la persistenza dopo il riavvio**

Fermare l'app (Ctrl+C), riavviarla con `./mvnw spring-boot:run`, poi:

```bash
curl -s "localhost:8080/api/expenses?month=2026-10"
# Atteso: la spesa "Affitto" è ancora presente
curl -s localhost:8080/api/categories
# Atteso: ancora 7 categorie, non 14 (il seeder non duplica)
```

- [ ] **Step 5: Controllare la console H2**

Aprire `http://localhost:8080/h2-console`, JDBC URL `jdbc:h2:file:./data/spese`, utente `sa`, password vuota. Expected: tabelle `CATEGORY`, `EXPENSE`, `MONTHLY_BUDGET`.

- [ ] **Step 6: Verificare che `data/` non finisca in git**

Run (dalla radice): `git status --short`
Expected: nessuna voce `BE/data/`.

- [ ] **Step 7: Commit (lo fa l'utente)**

Nessun file nuovo se tutto è passato. Se in questo task sono state fatte correzioni, si committano con il messaggio del task che possiede il codice corretto.
