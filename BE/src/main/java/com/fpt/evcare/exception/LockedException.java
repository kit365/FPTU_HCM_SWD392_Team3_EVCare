package com.fpt.evcare.exception;

public class LockedException extends RuntimeException {
    public LockedException(String message) {
        super(message);
    }
}
