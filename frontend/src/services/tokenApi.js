import axios from "axios";

// =====================================================
// API CONFIGURATION - EDIT THIS SECTION
// =====================================================
const API_BASE_URL = "http://localhost:3000";

const ENDPOINTS = {
    TOKENS: "/api/tokens",              // GET all tokens
    CREATE_TOKEN: "/api/tokens",        // POST create new token
    CALL_TOKEN: (id) => `/api/tokens/${id}/call`,       // PATCH/POST set status=called
    COMPLETE_TOKEN: (id) => `/api/tokens/${id}/complete`, // PATCH/POST set status=completed
};
// ====================================================

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { "Content-Type": "application/json" },
});

// Get all tokens (for staff dashboard)
export const getTokens = async () => {
    const response = await api.get(ENDPOINTS.TOKENS);
    return response.data;
};

// Create a new token (for customer page)
export const createToken = async () => {
    const response = await api.post(ENDPOINTS.CREATE_TOKEN);
    return response.data;
};

// Mark a token as "called"
export const callToken = async (id) => {
    const response = await api.patch(ENDPOINTS.CALL_TOKEN(id));
    return response.data;
};

// Mark a token as "completed"
export const completeToken = async (id) => {
    const response = await api.patch(ENDPOINTS.COMPLETE_TOKEN(id));
    return response.data;
};

// Get single token status
export const getTokenById = async (id) => {
    const response = await api.get(`/api/tokens/${id}`);
    return response.data;
};

export default api;