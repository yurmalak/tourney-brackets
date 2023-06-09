
import { createSeries, calculateScore } from '$lib/utils';

/** @typedef {import("../../types").Series} Series */
/** @typedef {import("../../lib/Tourney").Tourney} TourneyStore */
/** @typedef {import("../../lib/Tourney").Tourney} TourneyStore */


/**
 * @param {Series} series
 * @param {number} roundsTotal
 * @param {Series[][]} seriesByRound
 */
function populateSeries(series, roundsTotal, seriesByRound) {
    const { round, index } = series;

    // loser finals for 3rd place (second game of last round) doesn't fit normal schema
    const isLoserFinals = round === roundsTotal - 1 && index === 1;
    const prevSeriesIndices = isLoserFinals ? [0, 2] : [index * 2, index * 2 + 2];

    // check if series leading to this one have been finished
    const predecessors = seriesByRound[round - 1].slice(...prevSeriesIndices);
    predecessors.forEach((s, i) => {
        if (s.winner === undefined) return;

        series.players[i] = s.winner
        if (isLoserFinals) {
            const wIndex = s.players.indexOf(s.winner)
            const lIndex = 1 - wIndex
            series.players[i] = s.players[lIndex]
        }
    });
}


/** @param {TourneyStore} tourneyStore */
export default function bundleSeries(tourneyStore) {
    const { playersTotal, withTop3, participants } = tourneyStore.data;
    const roundsTotal = Math.log(playersTotal) / Math.log(2);

    // create array for each round
    const seriesByRound = [];
    for (let i = 0; i < roundsTotal; i++) seriesByRound[i] = [];

    // create empty series
    seriesByRound.forEach((arr, round) => {
        const numberOfSeries = 2 ** (roundsTotal - round - 1);
        for (let i = 0; i < numberOfSeries; i++) arr.push(createSeries(round, i));
    });

    // add losersFinals - second series of last round (for 3rd place)
    if (withTop3) {
        const losersFinals = createSeries(roundsTotal - 1, 1);
        seriesByRound[roundsTotal - 1].push(losersFinals);
    }

    // fill series with data
    seriesByRound.forEach((arr, round) => {

        // figure out which players played it based on previous rounds
        const populate = round === 0
            ? s => s.players = participants.slice(s.index * 2, s.index * 2 + 2)
            : s => populateSeries(s, roundsTotal, seriesByRound)

        //  participants are ordered the way they should be displayed
        arr.forEach((series, sIndex) => {

            populate(series)
            const data = tourneyStore.getSeries(round, series.players)
            Object.assign(series, data)
            series.score = calculateScore(series.games, series.players);

            // not all games finished
            if (series.games.some(g => !g.winner)) return

            const [a, b] = series.score
            const maxScore = Math.max(a, b);
            const seriesFinished = a !== b && maxScore >= tourneyStore.winsRequired(round, sIndex)
            if (seriesFinished) {
                const wIndex = series.score.indexOf(maxScore)
                series.winner = series.players[wIndex];
            }
        })
    });

    return seriesByRound
}