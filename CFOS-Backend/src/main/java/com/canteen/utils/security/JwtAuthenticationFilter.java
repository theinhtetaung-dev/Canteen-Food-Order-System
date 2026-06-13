package com.canteen.utils.security;

import com.canteen.utils.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(7);

        try {
            if (jwtUtil.isTokenValid(jwt)) {
                String username = jwtUtil.extractUsername(jwt);
                Integer userId = jwtUtil.extractUserId(jwt);
                String role = jwtUtil.extractRole(jwt);

                request.setAttribute("username", username);
                request.setAttribute("userId", userId);
                request.setAttribute("role", role);
                request.setAttribute("isAuthenticated", true);
            }
        } catch (Exception e) {
            request.setAttribute("isAuthenticated", false);
        }

        filterChain.doFilter(request, response);
    }
}
