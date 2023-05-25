import faunadb from "faunadb"
import { Tourney } from "../lib/Tourney";
import { calculateScore } from "../lib/utils";
import bundleSeries from "../components/brackets/PowersOf2/bundleSeries";
import anchors from "../HorseGame/data/anchors.json"
import processors from "../HorseGame/dataProcessors"
import staticData from "../mock/faunaStuff.json"


/** @type {import('./$types').PageServerLoad} */
export async function load() {

    let tourneyData, playersData
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

    const { width, height } = anchors
    const tourney = new Tourney(tourneyData)
    const seriesByRound = bundleSeries(tourney)

    const processedSeries = seriesByRound.map((rSeries, round) =>
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
                nodeLeftTop: anchors.coordinates[round][sIndex],
                data: processors.series(s),
                score: calculateScore(s.games, s.players),
                games: s.games.map(g => {

                    const game = processors.game(g, s)
                    if (g.winner) game.winner = s.players.indexOf(g.winner)
                    return game
                }),
            }

            return series
        })
    )

    return { processedSeries, width, height };
}