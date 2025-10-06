// helper
import { fetchInpi } from "./lib/helper/fetch-inpi.js"
import { getInpiToken } from "./lib/helper/get-token.js"
// API
import { inpiGetSiren } from "./lib/api/get-siren.js"
import { getInpiSirens } from "./lib/api/get-sirens.js"
// process
import { inpiProcess } from "./lib/process/inpi-process.js.js"


export const inpi = {
    helper: {
        fetch: fetchInpi,
        getToken: getInpiToken,
    },
    api: {
        getSiren: inpiGetSiren,
        getSirens: getInpiSirens,
    },
    process: inpiProcess,
}