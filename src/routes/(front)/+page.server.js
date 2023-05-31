import getBuildData from "../../HorseGame/getBuildData";


/** @type {import('./$types').PageServerLoad} */
export async function load() {

    const { processedSeries, width, height } = await getBuildData()
    return { processedSeries, width, height };
}