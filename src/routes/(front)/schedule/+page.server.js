import getBuildData from "../../../HorseGame/getBuildData";


/** @type {import('./$types').PageServerLoad} */
export async function load() {

    const { scheduleByRound } = await getBuildData()
    return { scheduleByRound };
}