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
import org.springframework.web.bind.annotation.RestController;

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

    /** Visibile anche agli altri test di contesto: espone solo rotte /test/*, innocue. */
    @RestController
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
