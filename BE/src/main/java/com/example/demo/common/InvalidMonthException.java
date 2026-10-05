package com.example.demo.common;

public class InvalidMonthException extends RuntimeException {
    public InvalidMonthException(String value) {
        super("Mese non valido: «" + value + "». Usa il formato AAAA-MM.");
    }
}
