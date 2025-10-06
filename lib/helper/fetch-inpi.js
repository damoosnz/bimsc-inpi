import { getInpiToken } from "./get-token.js";

let token

export async function fetchInpi(url) {

    if (!token) token = await getInpiToken()

    return await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

}