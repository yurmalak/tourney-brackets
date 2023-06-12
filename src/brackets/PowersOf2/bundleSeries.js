import Series from "../../lib/Series"

/** @param {import("../../lib/Tourney").Tourney} tourney */
export default function bundleSeries(tourney) {

    const { playersTotal, withTop3, participants } = tourney.data;
    const roundsTotal = Math.log(playersTotal) / Math.log(2);

    /** @type {Series[][]} */
    const seriesByRound = [];

    // create array for each round
    for (let i = 0; i < roundsTotal; i++) seriesByRound[i] = [];

    // fill with Series
    seriesByRound.forEach((arr, round) => {
        const numberOfSeries = 2 ** (roundsTotal - round - 1);

        const getStuff = round === 0
            // first round - no ancestors, players taken directly from participants
            ? sIndex => {

                const players = ["", ""]
                Object.assign(players, participants.slice(sIndex * 2, sIndex * 2 + 2))

                return { players, ancestors: [] }
            }
            // later rounds - players derived from ancestors
            : sIndex => {

                const prevRound = seriesByRound[round - 1]
                const ancestors = prevRound.slice(sIndex * 2, sIndex * 2 + 2)

                return { players: ["", ""], ancestors }
            }

        // create Series
        for (let sIndex = 0; sIndex < numberOfSeries; sIndex++) {
            const { players, ancestors } = getStuff(sIndex)
            const series = new Series({ tourney, round, sIndex, players, ancestors, isLoserSeries: false })
            arr.push(series)
        }

        // add top 3 to last round
        if (round === roundsTotal - 1 && withTop3) {
            const { players, ancestors } = getStuff(0)
            const series = new Series({ tourney, round, sIndex: 1, players, ancestors, isLoserSeries: true })
            arr.push(series)
        }
    });

    return { seriesByRound, extras: { withTop3 } }
}