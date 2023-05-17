
import { createSeries, calculateScore } from '$lib/utils';

/** @typedef {import("../../../types").Series} Series */
/** @typedef {import("../../../stores").Tourney} TourneyStore */


/**
 * @param {Series} series
 * @param {number} roundsTotal
 * @param {Series[][]} seriesByRound
 */
function populateSeries(series, roundsTotal, seriesByRound) {
    const { round, index } = series;

    // loser finals for 3rd place (second game of last round) doesn't fit normal schema
    const isLoserFinals = round === roundsTotal - 1 && index === 1;
    const prevGamesIndices = isLoserFinals ? [0, 2] : [index * 2, index * 2 + 2];

    // check if series leading to this one have been finished
    const predecessors = seriesByRound[round - 1]?.slice(...prevGamesIndices);
    predecessors.forEach((s, i) => {
        if (s.winner === undefined) return;

        let playerIndex = s.winner;
        if (isLoserFinals) playerIndex = 1 - playerIndex;

        series.players[i] = s.players[playerIndex];
    });
}


/** @param {TourneyStore} tourneyStore */
export default function bundleSeries(tourneyStore) {

    const { playersTotal, withTop3 } = tourneyStore;
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
        // add players
        if (round === 0) tourneyStore.assignPlayers(arr);
        else arr.forEach(series => populateSeries(series, roundsTotal, seriesByRound));

        // finals and loser finals are bo3, other bo1
        const bestOf = round < roundsTotal - 1 ? 1 : 2;

        // games and score
        for (const series of arr) {
            if (!series.players.every(Boolean)) continue;

            const names = series.players.map((p) => p.name);
            Object.assign(series, tourneyStore.getSeries(round, names))

            series.score = calculateScore(series.games);
            const maxScore = Math.max(...series.score);
            const seriesFinished = maxScore >= bestOf;
            if (seriesFinished) series.winner = series.score.indexOf(maxScore);
        }
    });

    return seriesByRound
}