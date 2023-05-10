/** @typedef {import('../types.ts').Game} Game */
/** @typedef {import('../types.ts').Series} Series */
/** @typedef {import('../types.ts').Participant} Participant */


/**
 * @param {number} round
 * @param {number} index
 * @returns {{ round: number, index: number, score: number[], players: Participant[], games: Game[]}}
 */
export function createSeries(round, index) {
    return {
        round,
        index,
        score: [0, 0],
        /** @type {Participant[]} */
        players: [],
        /** @type {Game[]} */
        games: []
    };
}

/**
 * 
 * @param {Series} series 
 * @param {Array<Array<Game>>} gamesByRound 
 * @param {Array<Array<Series>>} seriesByRound 
 * @param {number} roundsTotal 
 * @param {(round: number) => number} bestOf 
 * @returns 
 */
export function populateSeries(series, gamesByRound, seriesByRound, roundsTotal, bestOf) {

    // skip understaffed series
    if (!series.players[0] || !series.players[1]) {
        series.games = [];
        return;
    }

    for (const game of gamesByRound[series.round]) {
        // skip games with different players
        const samePlayers = series.players.every((p) => game.players.includes(p.name));
        if (!samePlayers) continue;

        series.games.push(game);
        if (game.winner !== undefined) {
            // players can be in different order
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

    populateSeries(nextSeries, gamesByRound, seriesByRound, roundsTotal, bestOf);
}


/**
 * @param {{ roundsTotal: number, playersTotal: number, tourneyPlayers: Array<Participant>, tourneyGames: Array<Game>}} args 
 */
export function bundleSeries(args) {

    const { roundsTotal, playersTotal, tourneyPlayers, tourneyGames } = args

    /** @type {Array<Array<Game>>} */
    const gamesByRound = Array(roundsTotal)
        .fill(1)
        .map(() => []);

    /** @type {Array<Array<Series>>} */
    const seriesByRound = Array(roundsTotal)
        .fill(1)
        .map(() => []);

    const idlePlayers = new Map(tourneyPlayers.map((p) => [p.name, p]));
    const finals = seriesByRound[roundsTotal - 1];

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
    for (const player of idlePlayers.values()) {
        const { name, sIndex, pIndex } = player;
        const series = firstRound[sIndex];
        if (!series) continue;

        const anotherOne = series.players[pIndex];
        if (anotherOne) {
            console.warn(`2 players aim for same slot (${name} and ${anotherOne.name}).`);
            continue;
        }

        series.players[pIndex] = player;
        idlePlayers.delete(name);
    }

    for (const game of tourneyGames) gamesByRound[game.round].push(game);

    return { gamesByRound, seriesByRound, finals, idlePlayers }
}