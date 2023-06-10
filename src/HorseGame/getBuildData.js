import faunadb from "faunadb"
import { Tourney } from "../lib/Tourney";
import { calculateScore } from "../lib/utils";
import bundleSeries from "../brackets/PowersOf2/bundleSeries";

import processors from "./dataProcessors";
/** @typedef {import('./types').FrontSeries} FrontSeries */


/** @type {FrontSeries[][]} */
let processedSeries

/** @type {[seriesDate:string, players:FrontSeries.players][][]} */
let scheduleByRound

/** Transforms data to shape expected by builder components. */
export default async function getBuildData() {

    // if already requested during this build
    if (processedSeries) return { processedSeries, scheduleByRound }

    // fetch data from Fauna
    let playersData, tourneyData
    if (process.env.NODE_ENV === "development") {
        ({ playersData, ...tourneyData } = await import("./staticData.json"))
    }
    else {
        const client = new faunadb.Client({
            secret: process.env.FAUNA_KEY,
            scheme: 'https',
        })

        const q = faunadb.query;
        [{ tourneyData }, playersData] = await client.query([
            q.Call("getData", null),
            q.Call("getPlayersData")
        ]);
    }

    // extract required minimum
    const tourney = new Tourney(tourneyData)
    const seriesByRound = bundleSeries(tourney);
    processedSeries = seriesByRound.map((rSeries, round) =>
        rSeries.map((series, sIndex) => {

            const players = series.players.some(Boolean)
                ? series.players.map(name => {

                    // not every series has both players defined 
                    if (!name) return null

                    let url
                    const [platform, userName] = Object.entries(playersData[name].media)[0]
                    switch (platform) {
                        case "twitch":
                            url = `https://www.twitch.tv/${userName}`
                            break

                        // youtube
                        // someOtherTube
                    }

                    return { name, url }
                })
                : null

            return {
                players,
                winner: series.winner ? series.players.indexOf(series.winner) : "",
                score: calculateScore(series.games, series.players),
                data: processors.series({ series, tourney, round, sIndex }),
                games: series.games.map(game => {

                    const g = processors.game({ game, series, tourney, round, sIndex })
                    if (game.winner) g.winner = series.players.indexOf(game.winner)

                    return g
                })
            }
        })
    )

    // make list of series with known dates
    scheduleByRound = processedSeries.map((list, round) => {

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
            const data = [time, startString, players]
            if (series.games.length) data.push(series.games.length)

            arr.push(data)
        })

        // sort and drop timestamp
        arr.sort((a, b) => (a[0] - b[0]))
        return arr.map(a => a.slice(1))
    })

    return { processedSeries, scheduleByRound }
}