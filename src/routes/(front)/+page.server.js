import getBuildData from "../../HorseGame/getBuildData";
import anchorsData from "../../HorseGame/anchors.json";


/** @type {import('./$types').PageServerLoad} */
export async function load() {

    const { processedSeries } = await getBuildData()
    return { processedSeries, anchorsData };
}