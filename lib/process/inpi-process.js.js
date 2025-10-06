export const inpiProcess = {
    siren: {
        personne: getPersonne,
        denomination: getDenomination,
        address: extractInpiHeadOfficeAddress,
        activity: extractCurrentInpiActivities
    },
}

function getPersonne(snRec) {
    return snRec.formality.typePersonne
}

function getDenomination(snRec) {

    const typePersonne = getPersonne(snRec)
    const formality = snRec.formality

    let denomination = null;

    if (typePersonne === 'P') {
        // Cas P: Personne Physique (Entrepreneur Individuel)
        const principalEtab = formality.content.personnePhysique?.etablissementPrincipal;
        const entrepreneurDesc = formality.content.personnePhysique?.identite?.entrepreneur?.descriptionPersonne;

        // PRIORITÉ 1: Nom Commercial (le nom que le public voit)
        if (principalEtab?.descriptionEtablissement?.nomCommercial) {
            denomination = principalEtab.descriptionEtablissement.nomCommercial;
        }
        // PRIORITÉ 2: Nom d'usage (Nom marital)
        else if (entrepreneurDesc?.nomUsage) {
            denomination = entrepreneurDesc.nomUsage;
        }
        // PRIORITÉ 3: Nom de naissance + Prénom
        else if (entrepreneurDesc) {
            const firstName = entrepreneurDesc.prenoms?.[0] || '';
            const lastName = entrepreneurDesc.nom || '';
            // Utilise le premier prénom + nom de naissance
            denomination = `${firstName} ${lastName}`.trim();
        }

    } else if (typePersonne === 'M' && formality.content.personneMorale?.denomination) {
        // Cas M: Personne Morale (Société) - Utiliser la dénomination officielle
        denomination = formality.content.personneMorale.denomination;

    } else if (formality.denomination) {
        // Fallback: Certaines structures simples peuvent avoir la dénomination à ce niveau
        denomination = formality.denomination;
    }

    // Assurer qu'on retourne 'N/A' si la valeur est une chaîne vide
    if (denomination) return denomination
    return null
}

function extractInpiHeadOfficeAddress(data) {
    if (!data || !data.formality || !data.formality.content) {
        return null;
    }

    const content = data.formality.content;
    let addRes = null;

    // 1. Determine if it's a 'Personne Morale' (Company) or 'Personne Physique' (Sole Proprietorship)
    if (content.personneMorale && content.personneMorale.adresseEntreprise) {
        // Sample 1 structure
        addRes = content.personneMorale.adresseEntreprise.adresse;
    } else if (content.personnePhysique && content.personnePhysique.adresseEntreprise) {
        // Sample 2 structure
        addRes = content.personnePhysique.adresseEntreprise.adresse;
    }

    if (!addRes) {
        return null;
    }

    // --- Address Construction ---

    // Street: Concatenate numVoie + typeVoie + voie
    const streetName = [
        addRes.numVoie,
        addRes.typeVoie,
        addRes.voie
    ].filter(Boolean).join(" ");

    // Street2: complementAdresseEtablissement is not directly in 'adresseEntreprise' structure,
    // so we use complementLocalisation or assume null based on the samples provided.
    const street2 = addRes.complementLocalisation || null;

    // City
    const city = addRes.commune || null;

    // Country
    const country = addRes.pays || "France";

    // Postal code
    const zip = addRes.codePostal || addRes.cedex || null;

    // --- Validation ---

    // Check if the essential components for a deliverable address exist
    const streetValid = streetName && streetName.length > 0;
    const cityValid = city && city.length > 0;
    const zipValid = zip && zip.length > 0;

    if (streetValid && cityValid && zipValid) {
        return {
            street: streetName,
            street2: street2, // Using complementLocalisation from the raw address object
            city: city,
            state: null, // As requested, set to null since the region/state isn't directly returned
            zip: zip,
            country: country,
        };
    }

    return null;
}

function extractCurrentInpiActivities(data) {
    if (!data || !data.formality || !data.formality.content) {
        return [];
    }

    const content = data.formality.content;
    let allActivities = [];
    
    // Get the current date for comparison (Today's date at midnight UTC)
    // We only need the date part (YYYY-MM-DD) for a consistent comparison with the data.
    const today = new Date().toISOString().slice(0, 10);

    // Helper function to extract and map activities from a single establishment block
    const mapActivities = (etab) => {
        if (etab && etab.activites && Array.isArray(etab.activites)) {
            return etab.activites.map(activity => ({
                description: activity.descriptionDetaillee,
                codeApe: activity.codeApe,
                isPrincipal: activity.indicateurPrincipal,
                isRolePrincipal: activity.rolePrincipalPourEntreprise,
                dateDebut: activity.dateDebut,
                dateFin: activity.dateFin || null
            }));
        }
        return [];
    };

    // --- 1. Get activities from the Principal Establishment ---
    let principalEtab = content.personneMorale?.etablissementPrincipal || 
                        content.personnePhysique?.etablissementPrincipal;
    
    allActivities = allActivities.concat(mapActivities(principalEtab));


    // --- 2. Get activities from Other Establishments ---
    const otherEtabs = content.personneMorale?.autresEtablissements || 
                       content.personnePhysique?.autresEtablissements;

    if (otherEtabs && Array.isArray(otherEtabs)) {
        otherEtabs.forEach(etab => {
            allActivities = allActivities.concat(mapActivities(etab));
        });
    }

    // --- 3. Filter for Current Activities ---
    
    return allActivities.filter(activity => {
        const hasDateFin = !!activity.dateFin;
        
        // Activity is CURRENT if:
        // 1. It has no end date (`dateFin` is null/undefined).
        // OR
        // 2. Its end date is *after* today's date.
        //    (The activity is active today, or will cease in the future).
        
        if (!hasDateFin) {
            return true;
        }

        // Compare date strings directly (YYYY-MM-DD format allows lexicographical comparison)
        // Note: The INPI data uses ISO date strings for dateFin (e.g., "2022-09-01"), so a simple
        // string comparison is reliable for determining if the date has passed.
        return activity.dateFin >= today;
    });
}