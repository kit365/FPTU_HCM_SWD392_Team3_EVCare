package com.fpt.evcare.serviceimpl;
import com.fpt.evcare.exception.JWTInitializationException;
import com.nimbusds.jose.JOSEException;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.nimbusds.jose.crypto.MACSigner;
import java.nio.charset.StandardCharsets;

@Getter
@Service
public class CustomJWTDecode {
    private final MACSigner macSigner;
    
    public CustomJWTDecode(@Value("${jwt.signer-key}") String jwtSignerKey) {
        try {
            if (jwtSignerKey == null || jwtSignerKey.isBlank()) {
                throw new JWTInitializationException("JWT_SIGNER_KEY is missing in application properties");
            }
            this.macSigner = new MACSigner(jwtSignerKey.getBytes(StandardCharsets.UTF_8));
        } catch (JOSEException e) {
            throw new JWTInitializationException("Failed to initialize MACSigner: " + e.getMessage());
        }
    }

}
