package com.canteen.utils.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.List;

@Component
public class RequireAuthInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        Object isAuthenticated = request.getAttribute("isAuthenticated");
        boolean isAuth = isAuthenticated != null && (Boolean) isAuthenticated;

        if (!isAuth && "/api/users".equals(request.getRequestURI()) && "POST".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        if (request.getRequestURI().startsWith("/api/foods") && "GET".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        if (request.getRequestURI().startsWith("/api/food-categories") && "GET".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        if (request.getRequestURI().startsWith("/api/branches") && "GET".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        if (request.getRequestURI().startsWith("/api/reviews") && "GET".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        if (!isAuth) {
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
        if ("SuperAdmin".equalsIgnoreCase(role)) {
            return true;
        }

        String uri = request.getRequestURI();

        if (uri.startsWith("/api/rbac")) {
            return false;
        }

        if (uri.equals("/api/users/me") || uri.startsWith("/api/users/me/") ||
            uri.equals("/api/users/change-password") || uri.startsWith("/api/users/change-password/") ||
            uri.startsWith("/api/notifications") ||
            uri.equals("/api/orders/my-orders") ||
            (uri.startsWith("/api/reviews") && "POST".equalsIgnoreCase(request.getMethod()))) {
            return true;
        }

        @SuppressWarnings("unchecked")
        List<String> userPermissions = (List<String>) request.getAttribute("permissions");
        if (userPermissions == null) {
            return false;
        }

        String method = request.getMethod();
        String requiredMenu = getRequiredMenu(uri);
        String requiredAction = getRequiredAction(method);

        if (requiredAction == null || requiredMenu == null) {
            return false;
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
        } else if (uri.startsWith("/api/dashboard") || uri.startsWith("/api/reports")) {
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
