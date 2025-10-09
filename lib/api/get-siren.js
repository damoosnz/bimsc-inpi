import { fetchInpi } from "../helper/fetch-inpi.js";

export async function inpiGetSiren(siren) {

    const url = `https://registre-national-entreprises.inpi.fr/api/companies/${siren}`;

    try {
        const response = await fetchInpi(url);     

        if (!response.ok) {
            console.log(`INPI RNE query for ${siren} error: Received non-OK status.`);
            const errorBody = await response.json().catch(() => ({})); 
            const errDetails = {
                status: response.status,
                text: response.statusText,
                details: errorBody,
                message: `API request failed with status ${response.status}.` // Add a main message
            };
            return { key: siren, val: null, err: errDetails };
        }

        const data = await response.json();
        return { key: siren, val: data, err: null };

    } catch (error) {
      
        console.log(`INPI RNE query for ${siren} error caught:`, error.message);
        const errorMessage = error.message || 'Unknown server-side error occurred.';
        return { key: siren, val: null, err: errorMessage };

    }
}