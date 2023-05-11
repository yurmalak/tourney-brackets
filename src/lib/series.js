/** @typedef {import('../types.ts').Game} Game */
/** @typedef {import('../types.ts').Series} Series */
/** @typedef {import('../types.ts').Participant} Participant */



/**
 * @param {number} round
 * @param {number} index
 * @returns {Series}
 */
export function createSeries(round, index) {

    /** @type {Series} */
    return {
        round,
        index,
        score: [0, 0],
        players: [null, null],
        games: []
    };
}

/**
 * @param {{
 *  series: Series, 
 *  seriesByRound: Array<Array<Series>>,
 *  roundsTotal: number, g
 *  getGames: (round: number, playerKeys: string[]) => Game[], 
 *  bestOf: (round: number) => number
 * }} args
 */
export function populateSeries(args) {

    const { series, seriesByRound, roundsTotal, getGames, bestOf } = args

    // skip understaffed series
    if (!series.players.every(Boolean)) return;

    const games = getGames(series.round, series.players.map(p => p.name))
    for (const game of games) {

        if (game.winner !== undefined) {
            const winnerName = game.players[game.winner];
            const winnerIndex = series.players.findIndex((p) => p.name === winnerName);
            series.score[winnerIndex]++;
        }
    }

    // check if series finished
    const [a, b] = series.score;
    const maxScore = Math.max(...series.score);
    const finished = a !== b && maxScore >= bestOf(series.round);
    if (!finished) return;

    series.winner = series.score.indexOf(maxScore);

    // winner goes to next round
    if (series.round >= roundsTotal - 1) return;
    const winner = series.players[series.winner];
    const nextRound = seriesByRound[series.round + 1];
    const nextSIndex = Math.floor(series.index / 2);
    const nextSeries = nextRound[nextSIndex];
    const nextPIndex = series.index % 2;
    nextSeries.players[nextPIndex] = winner;

    populateSeries({ ...args, series: nextSeries });
}

/**
 * @param {{ roundsTotal: number, playersTotal: number, tourneyPlayers: Array<Participant>}} args 
 */
export function bundleSeries(args) {

    const { roundsTotal, playersTotal, participants } = args

    /** @type {Array<Array<Series>>} */
    const seriesByRound = Array(roundsTotal)
        .fill(1)
        .map(() => []);

    let seriesInRound = playersTotal;
    for (let round = 0; round < roundsTotal; round++) {
        // each series takes 2 players
        seriesInRound /= 2;
        // create empty series
        for (let index = 0; index < seriesInRound; index++) {
            seriesByRound[round].push(createSeries(round, index));
        }
    }

    // assign players to first round
    const firstRound = seriesByRound[0];
    for (const player of participants) {
        const { name, sIndex, pIndex } = player;
        const series = firstRound[sIndex];
        if (!series) continue;

        const anotherOne = series.players[pIndex];
        if (anotherOne) {
            console.warn(`2 players aim for same slot (${name} and ${anotherOne.name}).`);
            player.sIndex = null
            player.pIndex = null
            continue;
        }

        series.players[pIndex] = player;
    }

    return seriesByRound
}