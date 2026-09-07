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
    private final com.canteen.repository.RoleRepository roleRepository;
    private final com.canteen.repository.RolePermissionRepository rolePermissionRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        final String token = (authHeader != null && authHeader.startsWith("Bearer "))
                ? authHeader.substring(7)
                : request.getParameter("token");

        if (token == null) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            if (jwtUtil.isTokenValid(token)) {
                String username = jwtUtil.extractUsername(token);
                String role = jwtUtil.extractRole(token);
                java.util.List<String> tokenPermissions = jwtUtil.extractPermissions(token);

                java.util.List<String> permissions = tokenPermissions;
                try {
                    if (role != null) {
                        var foundRole = roleRepository.findByRoleName(role);
                        if (foundRole.isPresent()) {
                            permissions = rolePermissionRepository.findByRoleIdWithPermissions(foundRole.get().getRoleId())
                                    .stream()
                                    .map(rp -> rp.getPermission().getMenuName() + "_" + rp.getPermission().getActionName())
                                    .toList();
                        }
                    }
                } catch (Exception dbEx) {
                    permissions = tokenPermissions;
                }

                request.setAttribute("username", username);
                request.setAttribute("permissions", permissions);
                request.setAttribute("role", role);
                request.setAttribute("isAuthenticated", true);
            }
        } catch (Exception e) {
            request.setAttribute("isAuthenticated", false);
        }

        filterChain.doFilter(request, response);
    }
}
