package com.fpt.evcare.security;

import com.fpt.evcare.serviceimpl.CustomJWTDecode;
import com.nimbusds.jose.JWSVerifier;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Date;
import java.util.List;

@Slf4j
@Component
@AllArgsConstructor
public class NimbusJwtAuthenticationFilter extends OncePerRequestFilter {

    private final CustomJWTDecode customJWTDecode;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String jwt = getJwtFromRequest(request);
            if (StringUtils.hasText(jwt) && validateToken(jwt)) {
                // Parse JWT và lấy claims
                SignedJWT signedJWT = SignedJWT.parse(jwt);
                JWTClaimsSet claims = signedJWT.getJWTClaimsSet();
                
                String username = claims.getStringClaim("username");
                
                // Lấy role từ JWT (single role)
                List<SimpleGrantedAuthority> authorities = new java.util.ArrayList<>();
                try {
                    String role = claims.getStringClaim("role");
                    if (role != null && !role.isEmpty()) {
                        authorities.add(new SimpleGrantedAuthority("ROLE_" + role));
                    } else {
                        // Fallback: default role
                        authorities.add(new SimpleGrantedAuthority("ROLE_CUSTOMER"));
                    }
                } catch (Exception e) {
                    log.warn("Could not parse role from JWT, using default role");
                    authorities.add(new SimpleGrantedAuthority("ROLE_CUSTOMER"));
                }

                // Log để debug
                log.debug("User {} authenticated with role: {}", username, authorities);

                // Tạo authentication token
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                username,
                                null,
                                authorities
                        );

                authentication.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );
                
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception ex) {
            log.error("Could not set user authentication in security context", ex);
        }

        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }

    private boolean validateToken(String token) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            JWSVerifier verifier = new MACVerifier(String.valueOf(customJWTDecode.getMacSigner()));

            boolean signatureValid = signedJWT.verify(verifier);
            boolean notExpired = signedJWT.getJWTClaimsSet()
                    .getExpirationTime()
                    .after(new Date());

            return signatureValid && notExpired;
        } catch (Exception e) {
            log.error("Token validation failed: {}", e.getMessage());
            return false;
        }
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        // Loại trừ các endpoint không cần xác thực JWT
        // Chỉ bypass JWT filter cho public auth endpoints
        return path.equals("/api/v1/auth/login") ||
                path.equals("/api/v1/auth/register") ||
                path.equals("/api/v1/auth/refresh") ||
                path.equals("/api/v1/auth/validate") ||
                path.equals("/api/v1/auth/validate-google-token") ||
                path.startsWith("/api/v1/auth/redis-tokens/") ||
                path.equals("/api/v1/auth/user") ||  // OAuth2 endpoint - dùng session authentication
                path.startsWith("/oauth2/") ||  // OAuth2 flow
                path.startsWith("/login/oauth2/") ||  // OAuth2 callback
                path.startsWith("/swagger-ui") ||
                path.startsWith("/v3/api-docs") ||
                path.startsWith("/api-docs") ||
                path.startsWith("/swagger-resources/") ||
                path.startsWith("/webjars/") ||
                path.startsWith("/configuration/") ||
                path.equals("/swagger-ui.html");
    }
}

