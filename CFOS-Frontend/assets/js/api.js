const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Core API wrapper to handle fetch requests with JWT tokens
 */
const api = {
    getHeaders(isFormData = false) {
        const token = localStorage.getItem('jwt_token');
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        if (!isFormData) {
            headers['Content-Type'] = 'application/json';
        }
        return headers;
    },

    async handleResponse(response) {
        if (response.status === 401 || response.status === 403) {
            localStorage.clear();
            window.location.href = 'index.html';
            throw new Error('Authentication expired or unauthorized.');
        }
        if (!response.ok) {
            const errorText = await response.text();
            let errMsg = 'API Error';
            try {
                const errObj = JSON.parse(errorText);
                errMsg = errObj.message || errMsg;
            } catch (e) {
                errMsg = errorText || errMsg;
            }
            throw new Error(errMsg);
        }
        
        // Return null for 204 No Content
        if (response.status === 204) return null;
        
        const text = await response.text();
        return text ? JSON.parse(text) : null;
    },

    async get(endpoint) {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'GET',
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    },

    async post(endpoint, data) {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(data)
        });
        return this.handleResponse(response);
    },

    async postFormData(endpoint, formData) {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: formData
        });
        return this.handleResponse(response);
    },

    async put(endpoint, data) {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(data)
        });
        return this.handleResponse(response);
    },

    async patch(endpoint, data) {
        let url = `${API_BASE_URL}${endpoint}`;
        // if data is string or number, pass it as query param for simple patching like status
        if (typeof data === 'string' || typeof data === 'number') {
            url += `?status=${encodeURIComponent(data)}`;
        }
        const response = await fetch(url, {
            method: 'PATCH',
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    },

    async delete(endpoint) {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'DELETE',
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }
};
