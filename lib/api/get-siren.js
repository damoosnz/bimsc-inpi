import { fetchInpi } from "../helper/fetch-inpi.js";

export async function inpiGetSiren(siren) {

    const err = { siren }

    // 2. Construire l'URL pour obtenir le détail de l'entreprise (SIREN)
    const url = `https://registre-national-entreprises.inpi.fr/api/companies/${siren}`;

    try {
        const response = await fetchInpi(url)

        // 3. Gestion des erreurs HTTP
        if (!response.ok) {

            console.log(`INPI RNE query for ${siren} error : !response.ok`)
            err.status = response.status
            err.text = response.statusText
            // console.error(`INPI RNE query for ${siren} failed (HTTP ${response.status}):`, response.statusText);
            // Tente de lire le corps de l'erreur pour plus de détails
            const errorBody = await response.json().catch(() => ({}));
            err.details = errorBody
            // console.error('INPI RNE Error Details:', errorBody);
            return { key: siren, val: null, err };
        }

        // 4. Retourner les données de l'entreprise
        const data = await response.json();
        // console.log(`Successfully retrieved company data for SIREN ${siren}.`);
        // La réponse contient l'objet de l'unité légale avec toutes les informations RNE
        return { key: siren, val: data, err: null };

    } catch (error) {

        err.status = response.status
        err.text = response.statusText
        err.details = error.message
        console.log(`INPI RNE query for ${siren} error :`, error.message)
        return { key: siren, val: null, err };
    }

}





