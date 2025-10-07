import { getInpiToken } from "./get-token.js";

let token = null

export async function fetchInpi(url) {

    try {
        if (token === null) token = await getInpiToken()
        if (token === null) throw new Error(`Authentication failed`);
    } catch (error) {
        return {err: `Authentication failed`}
    }

    try {
        return await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
    } catch (error) {
        token = null
        return {err: `fetch failed`}
    }
}