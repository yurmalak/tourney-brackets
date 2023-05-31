import getBuildData from "../../../HorseGame/getBuildData";


/** @type {import('./$types').PageServerLoad} */
export async function load() {

    const { seriesByRound, processedSeries } = await getBuildData()

    const scheduleByRound = []
    processedSeries.forEach((list, round) => {

        const arr = []
        list.forEach((series, i) => {

            // get players with links and readable datetime
            const startString = series.data.start
            if (!startString) return

            // get raw time
            const s = seriesByRound[round][i]
            const start = s.kvMap.find(([key]) => key === "начало")[1]
            const time = new Date(start).getTime()

            // ignore invalid
            if (isNaN(time)) return

            const players = [...series.players].sort((a, b) => b.name.length - a.name.length)
            arr.push([time, startString, players])
        })

        arr.sort((a, b) => (a[0] - b[0]))
        scheduleByRound.push(arr.map(a => a.slice(1)))
    })

    return { scheduleByRound };
}