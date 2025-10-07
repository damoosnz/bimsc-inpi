import { fetchInpi } from "../helper/fetch-inpi.js";

export async function inpiGetSiren(siren) {

    const url = `https://registre-national-entreprises.inpi.fr/api/companies/${siren}`;

    try {

        let err = {}
        const response = await fetchInpi(url)

        if (response.err) {
            return {key: siren, val : null, err: response.err}
        }

         if (!response.ok) {
            console.log(`INPI RNE query for ${siren} error : !response.ok`)
            err.status = response.status
            err.text = response.statusText
            const errorBody = await response.json().catch(() => ({}));
            err.details = errorBody
            return { key: siren, val: null, err };
        }

        const data = await response.json();
        return { key: siren, val: data, err: null };

    } catch (error) {

        console.log(`INPI RNE query for ${siren} error :`, error?.message)
        return { key: siren, val: null, err: error };

    }

}