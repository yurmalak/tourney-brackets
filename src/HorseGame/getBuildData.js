import faunadb from "faunadb"
import { Tourney } from "../lib/Tourney";
import { calculateScore } from "../lib/utils";
import bundleSeries from "../components/brackets/PowersOf2/bundleSeries";

import anchors from "./data/anchors.json"
import staticData from "./staticData.json"
import processors from "./dataProcessors"


const { width, height, coordinates } = anchors

let tourneyData, playersData, tourney, seriesByRound, processedSeries
export default async function getBuildData() {

    if (!processedSeries) {

        if (process.env.NODE_ENV === "development") {
            ({ playersData, ...tourneyData } = staticData)
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

        tourney = new Tourney(tourneyData)
        seriesByRound = bundleSeries(tourney)

        processedSeries = seriesByRound.map((rSeries, round) =>
            rSeries.map((s, sIndex) => {

                const players = !s.players.some(Boolean)
                    ? null
                    : s.players.map(name => {

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

                /** @type {import('../types').FrontSeries} */
                const series = {
                    players,
                    nodeLeftTop: coordinates[round][sIndex],
                    data: processors.series({ series: s, tourney }),
                    score: calculateScore(s.games, s.players),
                    games: s.games.map(g => {

                        const game = processors.game({
                            game: g,
                            series: s,
                            tourney
                        })
                        if (g.winner) game.winner = s.players.indexOf(g.winner)
                        return game
                    }),
                }

                return series
            })
        )
    }

    return { playersData, tourney, seriesByRound, processedSeries, width, height }
}