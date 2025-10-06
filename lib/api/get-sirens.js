import { bimscJs } from "bimsc-js-utils";
import { inpiGetSiren } from "./get-siren.js";

export async function getInpiSirens(sirens) {

    const calls = sirens.map(s => () => inpiGetSiren(s))
    const results = await bimscJs.promises.stagger(calls, 2025)

    const valids = results
        .filter(r => r.val !== null)

    const errs = results
        .filter(r => r.err)

    return [valids, errs]
}

