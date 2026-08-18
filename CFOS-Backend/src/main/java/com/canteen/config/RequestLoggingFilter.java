package com.canteen.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Logs every HTTP request and its response.
 *
 * Sample output:
 *   --> POST /api/auth/login (anonymous)
 *   <-- POST /api/auth/login 200 OK [42 ms]
 *
 *   --> GET /api/foods (admin)
 *   <-- GET /api/foods 200 OK [8 ms]
 */
@Slf4j
@Component
@Order(1)
public class RequestLoggingFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        // Skip noisy static/actuator endpoints
        String path = request.getRequestURI();
        if (shouldSkip(path)) {
            filterChain.doFilter(request, response);
            return;
        }

        String method = request.getMethod();
        String caller  = resolveCaller(request);
        long   start   = System.currentTimeMillis();

        // Skip logging OPTIONS preflight at INFO level — log at TRACE only
        if ("OPTIONS".equalsIgnoreCase(method)) {
            log.trace("--> {} {} (preflight, {})", method, path, caller);
            filterChain.doFilter(request, response);
            return;
        }

        log.info("--> {} {} [user={}]", method, path, caller);

        try {
            filterChain.doFilter(request, response);
        } finally {
            long elapsed = System.currentTimeMillis() - start;
            int  status  = response.getStatus();

            if (status >= 500) {
                log.error("<-- {} {} {} [{} ms]", method, path, status, elapsed);
            } else if (status >= 400) {
                log.warn("<-- {} {} {} [{} ms]", method, path, status, elapsed);
            } else {
                log.info("<-- {} {} {} [{} ms]", method, path, status, elapsed);
            }
        }
    }

    /** Extract caller identity from the Authorization header (JWT subject) or mark as anonymous. */
    private String resolveCaller(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) {
            try {
                // Decode the JWT payload (no verification here — logging only)
                String payload = auth.substring(7).split("\\.")[1];
                byte[] decoded = java.util.Base64.getUrlDecoder().decode(payload);
                String json = new String(decoded);
                // Extract "sub" field simply
                int subIdx = json.indexOf("\"sub\":");
                if (subIdx >= 0) {
                    int start = json.indexOf('"', subIdx + 6) + 1;
                    int end   = json.indexOf('"', start);
                    return json.substring(start, end);
                }
            } catch (Exception ignored) {
                return "token-parse-error";
            }
        }
        return "anonymous";
    }

    /** Paths that produce too much noise and don't need request logging. */
    private boolean shouldSkip(String path) {
        return path.startsWith("/actuator")
                || path.startsWith("/swagger")
                || path.startsWith("/v3/api-docs")
                || path.startsWith("/scalar")
                || path.startsWith("/food-images");
    }
}
