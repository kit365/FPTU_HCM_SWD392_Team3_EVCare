package com.fpt.evcare.config;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonNode;

import java.io.IOException;
import java.util.UUID;

public class UUIDDeserializer extends JsonDeserializer<UUID> {
    @Override
    public UUID deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        JsonNode node = p.getCodec().readTree(p);
        String value = node.asText();

        if (value == null || value.trim().isEmpty()) {
            return null;
        }

        try {
            return UUID.fromString(value);
        } catch (IllegalArgumentException e) {
            return generateUUIDFromString(value);
        }
    }

    private UUID generateUUIDFromString(String value) {
        String hash = String.valueOf(value.hashCode());
        String paddedHash = String.format("%032d", Math.abs(Long.parseLong(hash)));

        // Format as UUID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
        String uuidString = String.format(
                "%s-%s-%s-%s-%s",
                paddedHash.substring(0, 8),
                paddedHash.substring(8, 12),
                paddedHash.substring(12, 16),
                paddedHash.substring(16, 20),
                paddedHash.substring(20, 32)
        );

        return UUID.fromString(uuidString);
    }
}
