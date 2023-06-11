import getData from "../lib/getBuildData";

import processors from "./dataProcessors";
/** @typedef {import('./types').FrontSeries} FrontSeries */


/**
 * @type {{
 *  processedSeries: FrontSeries[][],
 *  scheduleByRound: [seriesDate:string, players:FrontSeries.players][][],
 *  processedPlayers: { [key: string]: string }
 * }} 
 */
let data


/** Transforms data to shape expected by builder components. */
export default async function getBuildData() {

    // if already requested during this build
    if (data) return data

    const { seriesByRound, processedSeries, processedPlayers } = await getData(processors)

    // make list of series with known dates
    const scheduleByRound = processedSeries.map((list, round) => {

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

            const players = [...series.players]
                .sort((a, b) => b.length - a.length)
                .map(name => ({ name, url: processedPlayers[name] }))

            const data = [time, startString, players]
            if (series.games.length) data.push(series.games.length)

            arr.push(data)
        })

        // sort and drop timestamp
        arr.sort((a, b) => (a[0] - b[0]))
        return arr.map(a => a.slice(1))
    })

    return data = { processedSeries, scheduleByRound, processedPlayers }
}