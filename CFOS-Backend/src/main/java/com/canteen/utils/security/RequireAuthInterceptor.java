package com.canteen.utils.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class RequireAuthInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        // Allow guest to register (POST /api/users)
        if ("/api/users".equals(request.getRequestURI()) && "POST".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        // Allow guest to browse menu (GET /api/foods/**)
        if (request.getRequestURI().startsWith("/api/foods") && "GET".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        // Allow guest to fetch canteen list (GET /api/branches)
        if (request.getRequestURI().startsWith("/api/branches") && "GET".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        // Allow guest to view reviews (GET /api/reviews)
        if (request.getRequestURI().startsWith("/api/reviews") && "GET".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        Object isAuthenticated = request.getAttribute("isAuthenticated");
        if (isAuthenticated == null || !(Boolean) isAuthenticated) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\": \"Unauthorized\", \"message\": \"Valid JWT token is required\"}");
            response.setContentType("application/json");
            return false;
        }

        if (!hasPermission(request)) {
            String requiredMenu = getRequiredMenu(request.getRequestURI());
            String requiredAction = getRequiredAction(request.getMethod());
            String requiredPermission = (requiredMenu != null && requiredAction != null) ? (requiredMenu + "_" + requiredAction) : "Unknown";

            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.getWriter().write("{\"error\": \"Forbidden\", \"message\": \"Access Denied: You do not have the required permission: " + requiredPermission + "\"}");
            response.setContentType("application/json");
            return false;
        }

        return true;
    }

    private boolean hasPermission(HttpServletRequest request) {
        String role = (String) request.getAttribute("role");
        if ("SuperAdmin".equalsIgnoreCase(role) || "Admin".equalsIgnoreCase(role) || "Manager".equalsIgnoreCase(role)) {
            return true;
        }

        @SuppressWarnings("unchecked")
        java.util.List<String> userPermissions = (java.util.List<String>) request.getAttribute("permissions");
        if (userPermissions == null) {
            return false;
        }

        String uri = request.getRequestURI();
        String method = request.getMethod();

        String requiredMenu = getRequiredMenu(uri);
        String requiredAction = getRequiredAction(method);

        if (requiredAction == null) {
            return false;
        }

        // Special exceptions: profile operations
        if (uri.startsWith("/api/users")) {
            if (uri.equals("/api/users/me") || uri.equals("/api/users/change-password")) {
                return true;
            }
        }

        if (requiredMenu == null) {
            return true; // if endpoint is not explicitly mapped, permit it by default
        }

        String requiredPermission = requiredMenu + "_" + requiredAction;
        return userPermissions.contains(requiredPermission);
    }

    private String getRequiredMenu(String uri) {
        if (uri.startsWith("/api/foods") || uri.startsWith("/api/food-categories")) {
            return "Food Category & Menu";
        } else if (uri.startsWith("/api/orders") || uri.startsWith("/api/payments")) {
            return "Orders & POS";
        } else if (uri.startsWith("/api/users")) {
            return "User Management";
        } else if (uri.startsWith("/api/rbac")) {
            return "Role & Permission System";
        } else if (uri.startsWith("/api/branches")) {
            return "Canteen Management";
        } else if (uri.startsWith("/api/dashboard")) {
            return "Dashboard";
        }
        return null;
    }

    private String getRequiredAction(String method) {
        if ("GET".equalsIgnoreCase(method)) {
            return "READ";
        } else if ("POST".equalsIgnoreCase(method)) {
            return "CREATE";
        } else if ("PUT".equalsIgnoreCase(method) || "PATCH".equalsIgnoreCase(method)) {
            return "UPDATE";
        } else if ("DELETE".equalsIgnoreCase(method)) {
            return "DELETE";
        }
        return null;
    }
}
