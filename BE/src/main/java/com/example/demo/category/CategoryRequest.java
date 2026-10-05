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

    /** Spazi esterni tolti prima della validazione: il limite di 30 caratteri vale sul nome vero. */
    public CategoryRequest {
        name = name == null ? null : name.strip();
    }
}
