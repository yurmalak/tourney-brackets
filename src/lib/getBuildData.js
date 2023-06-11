import faunadb from "faunadb"
import { Tourney } from "./Tourney";
import { calculateScore } from "./utils";

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
    const processedSeries = seriesByRound.map((rSeries, round) =>
        rSeries.map((series, sIndex) => ({
            players: series.players.some(Boolean) ? series.players : "",
            winner: series.winner ? series.players.indexOf(series.winner) : "",
            score: calculateScore(series.games, series.players),
            data: processors.series?.({ series, tourney, round, sIndex }) || {},
            games: series.games.map(game => {

                const g = {
                    data: processors.game?.({ game, series, tourney, round, sIndex }) || {}
                }
                if (game.winner) g.winner = series.players.indexOf(game.winner)

                return g
            })
        })
        )
    )

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