package com.fpt.evcare.serviceimpl;
import com.fpt.evcare.exception.JWTInitializationException;
import com.nimbusds.jose.JOSEException;
import io.github.cdimascio.dotenv.Dotenv;
import lombok.Getter;
import org.springframework.stereotype.Service;
import com.nimbusds.jose.crypto.MACSigner;
import java.nio.charset.StandardCharsets;

@Getter
@Service
public class CustomJWTDecode {
    private final MACSigner macSigner;
    public CustomJWTDecode() {
        try {
            Dotenv dotenv = Dotenv.load();
            String key = dotenv.get("JWT_SIGNER_KEY");
            if (key == null || key.isBlank()) {
                throw new JWTInitializationException("JWT_SIGNER_KEY is missing in .env");
            }
            this.macSigner = new MACSigner(key.getBytes(StandardCharsets.UTF_8));
        } catch (JOSEException e) {
            throw new JWTInitializationException("Failed to initialize MACSigner");
        }
    }

}
