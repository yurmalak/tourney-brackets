import faunadb from "faunadb"
import { Tourney } from "./Tourney";
import bundleSeries from "../brackets/bundleSeries"


export default async function getBuildData(processors = {}) {

    // fetch data from Fauna (or use local json for dev)
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

    // arrange series into rounds
    const tourney = new Tourney(tourneyData)
    const { seriesByRound, extras } = bundleSeries(tourney)

    // extract required minimum for series
    const processedSeries = seriesByRound.map(list => list.map(s => s.toFront(processors)))

    // extract required minimum for players
    const processedPlayers = {}
    if (processors.player) {
        for (const name in playersData) {
            processedPlayers[name] = processors.player(playersData[name])
        }
    }

    return {
        playersData,
        tourneyData,
        seriesByRound,
        processedSeries,
        processedPlayers,
        templateCode: tourney.data.templateCode,
        extras
    }
}