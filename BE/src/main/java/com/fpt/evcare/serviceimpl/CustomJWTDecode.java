package com.fpt.evcare.serviceimpl;


import io.github.cdimascio.dotenv.Dotenv;
import lombok.Getter;
import org.springframework.stereotype.Service;
import com.nimbusds.jose.crypto.MACSigner;
import java.nio.charset.StandardCharsets;

@Getter
@Service
public class CustomJWTDecode {

    private final MACSigner macSigner;

    public CustomJWTDecode() throws Exception {
        // Load biến môi trường từ .env
        Dotenv dotenv = Dotenv.load();
        String key = dotenv.get("JWT_SIGNER_KEY");

        // Tạo MACSigner với key
        this.macSigner = new MACSigner(key.getBytes(StandardCharsets.UTF_8));
    }

}
