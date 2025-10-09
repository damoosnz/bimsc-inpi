import { getInpiToken } from "./get-token.js"; 
// getInpiToken() must be an async function that returns the token string or throws.

// === MODULE-LEVEL STATE FOR TOKEN CACHING (Retained on warm invocation) ===
let token = null;
let lastRefreshTime = 0; 
const REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes

async function auth() {
    const now = Date.now();
    
    // Condition to refresh: No token (first call) OR refresh interval has passed
    const shouldRefresh = token === null || (now - lastRefreshTime) > REFRESH_INTERVAL;

    if (shouldRefresh) {
        try {
            const newToken = await getInpiToken();
            token = newToken;
            lastRefreshTime = now; 
            
        } catch (error) {
            token = null;
            lastRefreshTime = 0; 
            throw new Error(`Authentication failed during token retrieval: ${error.message}`); 
        }
    }
}

export async function fetchInpi(url) {
    // Ensure the token is valid (will throw if auth fails)
    await auth(); 
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            }
        });

        if (response.status === 401) {
            token = null;
            throw new Error(`INPI API call failed: Token unauthorized (HTTP 401).`);
        }
        
        if (!response.ok) {
            const errorText = await response.text().catch(() => 'No body provided');
            throw new Error(`INPI API call failed with status ${response.status}: ${errorText.substring(0, 100)}...`);
        }

        return response;

    } catch (error) {
        throw error;
    }
}