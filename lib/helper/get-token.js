export async function getInpiToken() {
    const username = process.env.INPI_USERNAME;
    const password = process.env.INPI_PASSWORD;
    const url = 'https://registre-national-entreprises.inpi.fr/api/sso/login';

    // 1. Prepare the JSON body with credentials
    console.log(`Attempting to retrieve token for user: ${username}`);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: username, password: password })
        });

        // 2. Check for HTTP errors (e.g., 401 Unauthorized, 404 Not Found)
        if (!response.ok) {
            console.error(`INPI Authentication failed (HTTP ${response.status}):`, response.statusText);
            const errorBody = await response.json().catch(() => ({}));
            console.error('INPI Error Details:', errorBody);
            throw new Error(`Authentication failed. Status: ${response.status} (${response.statusText})`);
        }

        // 3. Parse the successful JSON response
        const data = await response.json();
        console.log('Successfully received INPI token response.');
        return data.token;

    } catch (error) {
        console.error('Error during INPI token retrieval:', error.message);
        throw new Error(`Token generation failed: ${error.message}`);
    }
}